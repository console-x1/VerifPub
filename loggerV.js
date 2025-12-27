const fs = require("fs")

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////
////////// logs de verif
//////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveLOGE(LOG) {
    try {
        let data = fs.readFileSync('logs/Verif.txt', 'utf8');
        const log = data.split('\n');
        log.push(...LOG);
        data = log.join('\n');
        fs.writeFileSync('logs/Verif.txt', data);
    } catch (err) {
        console.log(err);
    }
}
module.exports = function loggV(verif) {    
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
    const text = verif
    const VERIF = `[VERIF]  || ${time}  ||  ${text}`
    const LOG = [];
    LOG.push(VERIF);
    saveLOGE(LOG);
}
