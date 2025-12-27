const fs = require("fs");
const crypto = require("crypto");

const path = "./pubs.json";

let data = {};
if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path, "utf8"));
} else {
    data = { pubs: {} };
}

function save() {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

function hasPub(content) {
    const hash = hashContent(content);
    return !!data.pubs[hash];
}

function createPub(content) {
    const hash = hashContent(content);
    if (!data.pubs[hash]) {
        data.pubs[hash] = { users: {} };
        save();
    }
    return hash;
}

function addUserToPub(content, userId) {
    const hash = createPub(content);
    if (!data.pubs[hash].users[userId]) {
        data.pubs[hash].users[userId] = { channels: {} };
        save();
    }
    return hash;
}

function addChannelToUser(content, userId, channelId) {
    const hash = addUserToPub(content, userId);
    if (!data.pubs[hash].users[userId].channels[channelId]) {
        data.pubs[hash].users[userId].channels[channelId] = 0;
        save();
    }
    return hash;
}

function incrementScore(content, userId, channelId, action) {
    const hash = addChannelToUser(content, userId, channelId);

    let score = data.pubs[hash].users[userId].channels[channelId];
    score += action;

    data.pubs[hash].users[userId].channels[channelId] = score;
    
    save();
    return score;
}

function getScore(content, userId, channelId) {
    const hash = hashContent(content);
    if (
        data.pubs[hash] &&
        data.pubs[hash].users[userId] &&
        data.pubs[hash].users[userId].channels[channelId] !== undefined
    ) {
        return data.pubs[hash].users[userId].channels[channelId];
    }
    return 0;
}

function getSelfVerif(content, userId, channelId) {
    const score = getScore(content, userId, channelId);

    let positif = score
    if (positif < 0) positif = -score

    if (positif == 0) return { value: false, score: score };
    if (positif >= 1 && positif <= 3) return { value: Math.random() > 1 / 1.5, score: score };
    if (positif >= 4 && positif <= 5) return { value: Math.random() > 1 / 3, score: score };
    if (positif >= 6 && positif <= 7) return { value: Math.random() > 1 / 6, score: score };
    if (positif >= 8) return { value: true, score: score };
}

module.exports = {
    hasPub,
    createPub,
    addUserToPub,
    addChannelToUser,
    incrementScore,
    getScore,
    getSelfVerif
};