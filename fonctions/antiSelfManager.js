const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(__dirname, "../anti-self.json");

async function initChannel(channel, limit = 25) {
    const data = loadData();

    const hasData = Object.values(data.pubs).some(pub =>
        Object.values(pub.users || {}).some(user =>
            user.channels[channel.id] && user.channels[channel.id].length > 0
        )
    );

    if (hasData) return

    const messages = await channel.messages.fetch({ limit });
    for (const msg of messages.values()) {
        if (msg.author.bot) continue;
        addPubMessage(msg.content, channel.id, msg.author.id, msg.createdTimestamp);
    }

    return
}


function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { pubs: {} };
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

function addPubMessage(content, channelId, userId, timestamp = Date.now()) {
    const data = loadData();
    const hash = hashContent(content);

    if (!data.pubs[hash]) {
        data.pubs[hash] = { users: {} };
    }

    if (!data.pubs[hash].users[userId]) {
        data.pubs[hash].users[userId] = { channels: {} };
    }

    if (!data.pubs[hash].users[userId].channels[channelId]) {
        data.pubs[hash].users[userId].channels[channelId] = [];
    }

    const arr = data.pubs[hash].users[userId].channels[channelId];
    const MS_IN_40H = 40 * 60 * 60 * 1000; // 40 heures en millisecondes

    if (!arr.includes(timestamp)) {
        arr.push(timestamp);
    }

    arr.sort((a, b) => b - a);

    let cutIndex = arr.length;

    for (let i = 0; i < arr.length - 1; i++) {
        const current = arr[i];
        const next = arr[i + 1];

        // Si l'écart entre current et next > 40h, on coupe à partir de next
        if (current - next > MS_IN_40H) {
            cutIndex = i + 1;
            break;
        }
    }

    arr.splice(cutIndex);

    if (arr.length > 20) {
        arr.splice(20);
    }

    saveData(data);

    return hash;
}

function detectSelfbotFromJson(userId, channelId, hash, tolerance = 0.05) {
    const data = loadData();
    const pub = data.pubs[hash];
    if (!pub) return false;

    const timestamps = pub.users?.[userId]?.channels?.[channelId];
    if (!timestamps || timestamps.length < 3) return false;

    const sorted = [...timestamps].sort((a, b) => a - b).slice(-5);

    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
        intervals.push((sorted[i] - sorted[i - 1]) / 1000);
    }

    if (intervals.length < 2) return false;

    for (let start = 0; start <= intervals.length - 2; start++) {
        const subset = intervals.slice(start, start + 2);
        const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
        const ok = subset.every(i => Math.abs(i - avg) <= avg * tolerance);
        if (ok) return true;
    }

    return false;
}

const file = path.join(__dirname, "../selfbot.json");

function know(userId) {
    if (!fs.existsSync(file)) return false;

    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        return Array.isArray(data.self) && data.self.includes(userId);
    } catch (e) {
        console.error("Erreur lecture JSON:", e);
        return false;
    }
}

function addId(userId) {
    let data = { self: [] };
    if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file, "utf8"));
    }
    if (!Array.isArray(data.self)) data.self = [];

    if (!data.self.includes(userId)) {
        data.self.push(userId);
        fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    }
}

function removeId(userId) {
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(data.self)) return;

    const newList = data.self.filter(id => id !== userId);
    data.self = newList;
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}



module.exports = {
    initChannel,
    loadData,
    saveData,
    hashContent,
    addPubMessage,
    detectSelfbotFromJson,
    know,
    addId,
    removeId
};