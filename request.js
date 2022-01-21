// server token SPVMC7DYW5SJWTSNWQJIL33I6LICH5LK
const fs = require('fs')
const fetch = require('node-fetch');

const data = fs.readFileSync('recording.mp3', 'utf8')

fetch('https://api.wit.ai/message?v=20211210&q=testing', { method: "GET", headers: { Authorization: "Bearer SPVMC7DYW5SJWTSNWQJIL33I6LICH5LK"}})
    .then(res => res.text())
    .then(text => console.log(text));



fetch('https://api.wit.ai/speech?v=20211210', { method: "POST", headers: { Authorization: "Bearer SPVMC7DYW5SJWTSNWQJIL33I6LICH5LK", "Content-Type": "audio/mpeg3", }, body: data, })
    .then(res => res.text())
    .then(text => console.log(text));

// curl -XPOST "https://api.wit.ai/speech?v=20211209" -i -L -H "Authorization: Bearer SPVMC7DYW5SJWTSNWQJIL33I6LICH5LK" -H "Content-Type: audio/mpeg3" --data-binary "@recording.mp3"