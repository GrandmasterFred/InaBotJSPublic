const { EndBehaviorType, VoiceReceiver } = require('@discordjs/voice');
const { User } = require('discord.js');
const { createWriteStream } = require('node:fs');
const prism = require('prism-media');
const { pipeline } = require('node:stream');

function getDisplayName(userId, user) {
	return user ? `${user.username}_${user.discriminator}` : userId;
}

// the functions in this export will be yeeted to the other folder 
module.exports = {
    testFunction: function(a, b) {
        return a + b
    },
    
    // apparently you need a comma behind stuff for it to work
    createListeningStream: function(receiver, userId, user) {
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
    
        pipeline(opusStream, oggStream, out, (err) => {
            if (err) {
                console.warn(`Error recording file ${filename} - ${err.message}`);
            } else {
                console.log(`Recorded ${filename}`);
            }
        });
    }
}
