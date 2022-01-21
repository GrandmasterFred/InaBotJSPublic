require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const master = process.env.DISCORD_MASTER;
const witUrl = process.env.WIT_URL;


var child_process = require('child_process');

//let toExecute = `curl -XPOST "https://api.wit.ai/speech?v=20211209" -i -L -H "Authorization: Bearer SPVMC7DYW5SJWTSNWQJIL33I6LICH5LK" -H "Content-Type: audio/mpeg3" --data-binary "@recording2.mp3"`
let toExecute = witUrl

var exec = require('child_process').exec;

let outputData = "" 

exec(toExecute, function (error, stdout, stderr) {
    //console.log(typeof stdout)
    let data = JSON.stringify(stdout)
    let dataList = data.split(String.raw`\r\n`)
    let lastData = dataList.at(-1)
    let secondLastData = dataList.at(-2)
    console.log(lastData)
    console.log(secondLastData)
    data = secondLastData

    //console.log('stdout: ' + JSON.stringify(stdout));
    //console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
});

console.log(outputData + "this ting")


