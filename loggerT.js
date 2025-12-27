const fs = require("fs")

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////
////////// logs textuel
//////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveLOGT(LOG) {
    try {
        let data = fs.readFileSync('logs/TEXT.txt', 'utf8');
        const log = data.split('\n');
        log.push(...LOG);
        data = log.join('\n');
        fs.writeFileSync('logs/TEXT.txt', data);
    } catch (err) {
        console.log(err);
    }
}

module.exports = function loggT(msg) {
    if (!msg == "\n") {
        //*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/ TIME /////////////////////////////////////////////////////////////////////////////
        const d = new Date()
        var jours = d.getDate().toString().padStart(2, "0")
        var mois = (d.getMonth() + 1).toString().padStart(2, "0")
        var année = d.getFullYear().toString().padStart(2, "0")
        var heures = d.getHours().toString().padStart(2, "0")
        var minutes = d.getMinutes().toString().padStart(2, "0")
        var secondes = d.getSeconds().toString().padStart(2, "0")
        var milliseconds = d.getMilliseconds().toString().padStart(3, "0")
        const time = ` ${jours}/${mois}/${année}   =>>   ${heures}h ${minutes}m ${secondes}s ${milliseconds}ms `
        //*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/ CODE DE LOG ///////////////////////////////////////////////////////////////////////
        const text = msg
        const MSG_T = `[TEXT]  || ${time}  ||  ${text}`
        const LOG = [];
        LOG.push(MSG_T);
        saveLOGT(LOG);
    }
    else {
        const MSG_T = `\n\n`
        const LOG = [];
        LOG.push(MSG_T);
        saveLOGT(LOG);
    }
}