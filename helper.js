const { USERNAME } = require("./.secrets.js");
const { trim } = require('lodash');
function tsvJSON(tsv){
    var lines=tsv.split("\n");
    var result = [];
    var headers=lines[0].split("\t");
  
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split("\t");
        for(var j=0;j<headers.length;j++){
        const value = trim(currentline[j]);
        const key = trim(headers[j]);
            obj[key] =  key === 'Points' ? parseInt(value) : value.toLowerCase();
        }
        result.push(obj);
    }
    
    return result;


}

function canSummon(msg){
    return msg && msg.toLowerCase().includes(`u/${USERNAME.toLowerCase()}`);
};

function calculateSmashLingoKnowledge(text, terms) {
    let points = 0;
    terms.forEach(term=>{
        let aliases = term.Aliases.split(",");
        aliases.forEach(alias=>{
            if(text.includes(alias)){
                // console.log(alias);
              points = points + term.Points
            }
        })
    })

    return `>>${text}\n\nThis comment requires at least level (${points}) smash lingo knowledge to understand`;
}

module.exports = {
    tsvJSON, canSummon, calculateSmashLingoKnowledge
}
