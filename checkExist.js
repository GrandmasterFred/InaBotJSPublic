const fs = require('fs')

const path = './ou1t.mp3'

while (fs.existsSync(path) != true) {
    console.log('does not exist')
}

try {
  if (fs.existsSync(path)) {
    //file exists
    console.log("yes")
  }
} catch(err) {
  console.error(err)
}