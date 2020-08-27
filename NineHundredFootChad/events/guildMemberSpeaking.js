const { Transform } = require('stream');

const Dispatcher = require('../promised/Dispatcher');
const googleSpeech = require('@google-cloud/speech');
const googleSpeechClient = new googleSpeech.SpeechClient();
const playChad = require('../voiceutils/playChad.js')
module.exports = async (client, member, speaking) => {

    console.log("--------In guildMemberSpeaking event handler...");
    console.log("\tclient = " + client);
    console.log("\tclient.voiceConnection = " + client.voiceConnection);
    console.log("\tclient.okEnabled = " + client.okEnabled);
    console.log("\tspeaking = " + speaking); 
    console.log("\tmember = " + member);
    console.log("client.secretWordGame = " + client.secretWordGame);
    
    if (!speaking) return;
    
    //TODO: find a better way to handle this-- dont transcribe unless we need to.
    if (!client.okEnabled && !client.secretWordGame) return;
    
    //don't listen to bots (like Groovy)
    if (member.user.bot) {
    	console.log(`Ignoring ${member.displayName} because its a bot!`);
    	return;
    }

    console.log(`I'm listening to ${member.displayName}`);
    
    const voiceConnection = client.voiceConnection;
    const receiver = voiceConnection.receiver;

    // this creates a 16-bit signed PCM, stereo 48KHz stream
    const audioStream = receiver.createStream(member, {mode: "pcm"});
    const requestConfig = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US'
    };
    const request = {
        config: requestConfig
    };
    const recognizeStream = googleSpeechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', async response => {
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n')
                .toLowerCase();

            console.log(`Transcription: ${transcription}`);

            // play an audio file if keyword is detected
            if (client.okEnabled == true) {
            	if (transcription.includes("okay")) {
            		console.log(`I just heard ${member.displayName} say OK!  Calling playChad)...`);
            		await playChad.playChad(member.voice.channel, 1);
            	}            	
            }
            
            if (client.secretWordGame == true) {
            	//console.log("looking for secret word: " + client.secretWordGameWord);
//            	if (transcription.includes(client.secretWordGameWord)) {
            	if (RegExp( '\\b' + client.secretWordGameWord + '\\b', 'i').test(transcription)) {
            		client.secretWordGameChannel.send("OMG you said the secret word!  It was: " + client.secretWordGameWord);
            		client.secretWordGameChannel.send(`${member.displayName} was the winner!`);
            		
            		client.secretWordGameChannel.send(`CONTEXT: I heard ${member.displayName} mutter the following: "` + transcription + "\"");
            		
            		client.secretWordGameWord = "";
            		client.secretWordGame = false;

                    await playChad.playCelebration(member.voice.channel);
            	}
            }
        });

    const convertTo1ChannelStream = new ConvertTo1ChannelStream();

    audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream);

    audioStream.on('end', async () => {
        console.log(`I'm done listening to ${member.displayName}`);
    })
};

function convertBufferTo1Channel(buffer) {
    const convertedBuffer = Buffer.alloc(buffer.length / 2);

    for (let i = 0; i < (convertedBuffer.length / 2) - 1; i++) {
        const uint16 = buffer.readUInt16LE(i * 4);
        convertedBuffer.writeUInt16LE(uint16, i * 2)
    }

    return convertedBuffer
}

class ConvertTo1ChannelStream extends Transform {
    constructor(source, options) {
        super(options)
    }

    _transform(data, encoding, next) {
        next(null, convertBufferTo1Channel(data))
    }
}