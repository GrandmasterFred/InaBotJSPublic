// this is the main file for Inabot, where all the magic happens
// this main file is a bloody mess goddammit fred fix it 


// require the necessary discord.js classes
const { Client, Intents, NewsChannel } = require('discord.js');
const ffmpeg = require('ffmpeg');
const { join } = require('path');
const fs = require('fs');
// const { createListeningStream, testFunction } = require('./createListeningStream');
const { unlink } = require('fs/promises')

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require('fluent-ffmpeg');
FFmpeg.setFfmpegPath(ffmpegPath);

const { EndBehaviorType, VoiceReceiver } = require('@discordjs/voice');
const { User } = require('discord.js');
const { createWriteStream } = require('node:fs');
const prism = require('prism-media');
const { pipeline } = require('node:stream');

const { generateDependencyReport, getVoiceConnection } = require('@discordjs/voice');

console.log(generateDependencyReport());

const { AudioPlayerStatus, createAudioResource, StreamType, createAudioPlayer, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

const { createDiscordJSAdapter } = require('./adapter.js');
const { dirname } = require('path/posix');
const { INSPECT_MAX_BYTES } = require('buffer');
const { on } = require('events');

// using env file instead of the config file
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const master = process.env.DISCORD_MASTER;
const witUrl = process.env.WIT_URL;

const botPrefix = 'wah '

const player = createAudioPlayer()

// this section defines sounds 
const wahLoc = String.raw`audioClip/wahs`
const wahFiles = fs.readdirSync(wahLoc);

const hehLoc = String.raw`audioClip/heh`
const hehFiles = fs.readdirSync(hehLoc);


function speechToText(fileName) {
    // this function takes in the name of the file to be send, and then 
    // sends it over, and then returns the text generated from it 
    console.log("in speech to text")
    var exec = require('child_process').exec;

    let toExecute = witUrl

    let data = ""     

    // this section blocks for a bit to ensure that the output is done 
    let path = './out.mp3'
    while (fs.existsSync(path) != true) {
        // blocking 
    }

    exec(toExecute, function (error, stdout, stderr) {
        //console.log(typeof stdout)
        let data = JSON.stringify(stdout)
        let dataList = data.split(String.raw`\r\n`)
        let lastData = dataList.at(-1).toLowerCase()
        let secondLastData = dataList.at(-2).toLowerCase()
        console.log(lastData)
        console.log(secondLastData)

        //unlink(fileName)
        // will have to undergo the checking in here, to call the new function
        // that will cause the wah 
        if (secondLastData.includes("give") && secondLastData.includes("me")) {
            console.log('word detected')
            playSound();
        } else if (secondLastData.includes("what")) {
            console.log('assume is wah')
            playSound();
        } else if (secondLastData.includes("where") && secondLastData.includes("brian")) {
            console.log('sad brian')
            playSound('heh');
        } else if (secondLastData.includes("who") && secondLastData.includes("this")) {
            console.log('assume is wah')
            playSound();
        } else {
            playSound()
        }  
        
    }); 
}


function getDisplayName(userId, user) {
	return user ? `${user.username}_${user.discriminator}` : userId;
}


// an asynchronous implementation of ffmpeg 
// https://stackoverflow.com/questions/59331821/fluent-ffmpeg-not-running-synchronously
function ffmpegSync(filename, path2) {
    return new Promise((resolve, reject) => {
        FFmpeg({source: filename}).addOption('-ac', 1).saveToFile(path2).on('end', () => {
            console.log('ffmpeg done!');
            resolve()
        })
        .on('error', (err) => {
            return reject(new Error(err))
        })
    })
}



async function createListeningStream(receiver, userId, user) {
    console.log('inside listening stream function')
    
    const opusStream = receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 100,
        },
    });

    const oggStream = new prism.opus.OggLogicalBitstream({
        opusHead: new prism.opus.OpusHead({
            channelCount: 2,
            sampleRate: 48000,
        }),
        pageSizeControl: {
            maxPackets: 10,
        },
    });

    const filename = `./recordings/${Date.now()}-${getDisplayName(userId, user)}.ogg`;

    const out = createWriteStream(filename);

    console.log(`👂 Started recording ${filename}`);

    pipeline(opusStream, oggStream, out, async (err) => {
        if (err) {
            console.warn(`Error recording file ${filename} - ${err.message}`);
        } else {
            console.log(`Recorded ${filename}, converting it`);

            // deleting the file first, so that the ffmpeg can save to it 
            let path2 = 'out.mp3'
            // if an old out mp3 exists, delete it 
            if (fs.existsSync(path2) ) {
                fs.unlinkSync(path2)
                console.log('old recordinds found, deleting')
            } else {
                console.log('no old recordings found')
            }

            // var command = FFmpeg({source: filename}).addOption('-ac', 1).saveToFile(path2)
            await ffmpegSync(filename, path2)
            console.log('conversion done')

            // this section will do the api call, and then dispose of the made files 
            data = speechToText(path2)
        }
    });
}

// this function is to do like a heartbeat thingy to see 
// whether other events happens when something else is happening 
// or not 
async function heartBeat(message) {
    var tempVar = 1 
    while (1 == 1) {
        tempVar = tempVar + 1;
        console.log('test' + tempVar);
        // note that this is non-blocking, so it will not block the 
        // execution of the other functions 
        setTimeout(function(){ console.log("Hello"); }, 3000);
    }   
}

function playSound(tempStr) {
    // using the String.raw to specify the correct file path 
    if (tempStr == 'heh') {
        let tempWahLoc = join(__dirname, hehLoc, hehFiles[Math.floor(Math.random()*hehFiles.length)]);
        
        let resource = createAudioResource(tempWahLoc, {inputType: StreamType.OggOpus});

        console.log('currently playing' + tempWahLoc)

        // apparently it is file to attatch the audio player early, as such, this is fine
        player.play(resource);

        // using helper function, where nothing happens if player enter playing within 5 sec
        // otherwise it will reject with an error 
        return entersState(player, AudioPlayerStatus.Playing, 5e3);
    } else {
        let tempWahLoc = join(__dirname, wahLoc, wahFiles[Math.floor(Math.random()*wahFiles.length)]);
        
        let resource = createAudioResource(tempWahLoc, {inputType: StreamType.OggOpus});

        console.log('currently playing' + tempWahLoc)

        // apparently it is file to attatch the audio player early, as such, this is fine
        player.play(resource);

        // using helper function, where nothing happens if player enter playing within 5 sec
        // otherwise it will reject with an error 
        return entersState(player, AudioPlayerStatus.Playing, 5e3);
    }
}



// create a new client instance
const client = new Client ({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');
    client.user.setActivity("Minecraft", { type: "PLAYING"})

    try {
        console.log('trying out the playing thing');
        await playSound();
        console.log('song is ready to play');
    } catch (error) {
        // throw out the error here 
        console.error(error);
    }
});


// defines the async function that allows connection to channel
async function connectToChannel(channel) {
    // we try to establish connection to a voice channel 
    console.log('attepting connection')
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: createDiscordJSAdapter(channel),
    });

    console.log('attempt created')
    // checking for voice state and other stuff 
    try {
        // allow 30 seconds of connection 
        console.log('waiting for ready')
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}


// this section will listen to voice state updates 
client.on('voiceStateUpdate', async (oldState, newState) => {
    // checks if it goes from muted to unmuted i guess 
    if (newState.member.id == master) {
        console.log('this is fred')
        if ((oldState.mute == true) && (newState.mute == false)) {
            console.log('member got unmuted')
            // then check if bot is in the voice channel or not, if yes, execute the recording function 
            let connection = getVoiceConnection(newState.guild.id)
            if (connection) {
                console.log('bot is connected, executing recording function thingy')
                let receiver = connection.receiver
                let userID = newState.member.id
                createListeningStream(receiver, userID, userID); 
            } else {
                console.log('bot is not connected')
            }
            
        }
    }
})


// async has to be there for some reason? 
client.on('messageCreate', async (message) => {
    // i should eventually switch this to a case statement, as this is getting 
    // tedious to maintain
    if (message.content.startsWith(botPrefix)) {
        if (message.content.startsWith(botPrefix + "join")) {
            // this is to trigger recording (wah record)
            // this will be the section to join inabot into the channel
            // that the person tells them to be connected to 
            let channel = message.member.voice.channel;

            if (channel) {
                // this section tries to connect to the voice channel
                try {
                    console.log('trying to connect to channel');
                    const connection = await connectToChannel(channel);
                    connection.subscribe(player);
                    console.log('connected, and player added')
                    playSound()
                } catch (error) {
                    // this means that the player cant join the channel
                    console.error(error);
                }
            }
        } else if (message.content.startsWith(botPrefix + "record")) {
            // this section will attempt to call the recording module 
            await message.channel.send('attempting recording')
            
            console.log(message.author.id)
            console.log(master)
            if (master == message.author.id) {
                console.log('yes')
            }
            // the recording function needs (interaction, whoIsRecordable, client, voiceConnection)
            let connection = getVoiceConnection(message.guildId)
            if (connection) {
                // this means that this bot is connected to a channel
                let userID = message.author.id
                let receiver = connection.receiver
                if (master == userID) {
                    console.log('inside tiny loop')
                    // skips whatever checks, starts recording me 
                    createListeningStream(receiver, userID, userID);                  
                }
            }

            // this two down here is an example of using function 
            // let tempVar = testFunction(1, 2)
            // await message.channel.send(tempVar.toString())
        } else if (message.content.startsWith(botPrefix + "wah")) {
            //await playSound();
            playSound();
            console.log('playing sound again')
        } else if (message.content.startsWith(botPrefix + "heh")) {
            //await playSound();
            playSound('heh');
            console.log('playing sound again')
        } else if (message.content.startsWith(botPrefix + "heartBeat")){
            console.log('heartbeat')
            message.channel.send('executing heartbeat')
            await heartBeat(message)
        } else if (message.content.startsWith(botPrefix + "leave")){
            let connection = getVoiceConnection(message.guildId)
            connection.destroy();
        }else {
            // this just repeats the message (wah)
            message.channel.send(message.author.username);
        }
    }
})



// Login to Discord with your client's token
client.login(token);