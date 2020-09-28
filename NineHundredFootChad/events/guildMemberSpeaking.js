require('dotenv').config();
const config = require('../config');
const { Transform } = require('stream');
const websocket = require('ws');
const fs = require('fs');
const waveResampler = require('wave-resampler');
const wav = require('wav');
const SampleRate = require('node-libsamplerate');
const Dispatcher = require('../promised/Dispatcher');
const playChad = require('../voiceutils/playChad.js')

module.exports = async (client, member, speaking) => { 
    
    console.log("--------In guildMemberSpeaking event handler...");
    console.log("\tclient = " + client);
    console.log("\tclient.voiceConnection = " + client.voiceConnection);
    console.log("\tclient.okEnabled = " + client.okEnabled);
    console.log("\tspeaking = " + speaking);
    console.log("\tmember = " + member);

    var transcript = "EMPTY";

    if (!speaking) return;

    //don't listen to bots (like Groovy)
    if (member.user.bot) {
        console.log(`Ignoring ${member.displayName} because its a bot!`);
        return;
    }

    console.log(`I'm listening to ${member.displayName}`);

    console.log("setting up voiceConnection and receiver...");
    const voiceConnection = client.voiceConnection;
    const receiver = voiceConnection.receiver;

    // this creates a 16-bit signed PCM, stereo 48KHz stream
    //const audioStream = receiver.createStream(member, { mode: "pcm" });

    //    const ws = new websocket('wss://api.alphacephei.com/asr/en/');
    console.log("creating new websocket to vosk server (with callbacks): " + `ws://${config.voskServer}`);
    const ws = new websocket(`ws://${config.voskServer}`);

    ws.on('open', async function open() {
        console.log("In 'open' callback...");
        console.log("creating readStream...");
//        var readStream = fs.createReadStream('./static/test-vosk.wav');
        var readStream = receiver.createStream(member, { mode: "pcm" });

        const convertTo1ChannelStream = new ConvertTo1ChannelStream();
        
        let options = {
            // Value can be from 0 to 4 or using enum. 0 is the best quality and the slowest.
            type: 2,
            // Stereo
            channels: 2,
            // Sample rate of source
            fromRate: 48000,
            // bit depth of source. Valid values: 16 or 32
            fromDepth: 16,
            // Desired sample rate
            toRate: 8000,
            // Desired bit depth. Valid values: 16 or 32
            toDepth: 16
        };        
        
        let wavWriter = wav.Writer(
            {
                channels: 1,
                sampleRate: 8000,
                bitDepth: 16
            }
            );
            
        const resample = new SampleRate(options);

        readStream.pipe(convertTo1ChannelStream).pipe(resample).pipe(wavWriter).pipe(appendChunkToFile('./static/temp/user_audio-tweak2'));
        debugonce = true;

        wavWriter.on('data', function (chunk) {
            //console.log(`Sending ${chunk.length} bytes of data to Vosk (data callback on wavWriter)...`);
            if (debugonce) {
                console.log("first chunk = " + chunk);
                debugonce = false;
            }    
            ws.send(chunk);
        });    
        wavWriter.on('end', function () {
            console.log("END of readStream data... EOF.");
            ws.send('{"eof" : 1}'); 
        });    
        wavWriter.on('error', function (error) {
            console.log("ERROR callback on readStream generation: " + error);
        });    
        wavWriter.on('header', function (header) {
            console.log("got header callback!  HEADER=" + header);
        });    

    });

    ws.on('message', async function incoming(data) {
        //console.log("In websocket 'message' callback...");
        var jsonData = JSON.parse(data);
        //if json data contains "result", then the "text" will contain the final transcription
        if ((typeof jsonData.text !== 'undefined') && (typeof jsonData.result !== 'undefined')) {
            console.log("Got final text: " + jsonData.text);
            transcript = jsonData.text;
            //play an audio file if keyword is detected
            if (client.okEnabled == true) {
                if (transcript.includes("okay")) {
                    console.log(`I just heard ${member.displayName} say OK!  Calling playChad)...`);
                    await playChad.playChad(member.voice.channel, 1);
                }
            }

            if (client.secretWordGame == true) {
                //console.log("looking for secret word: " + client.secretWordGameWord);
//            	if (transcription.includes(client.secretWordGameWord)) {
            	if (RegExp( '\\b' + client.secretWordGameWord + '\\b', 'i').test(transcript)) {
            		client.secretWordGameChannel.send("OMG you said the secret word!  It was: " + client.secretWordGameWord);
                    client.secretWordGameChannel.send(`${member.displayName} was the winner!`);
            		
            		client.secretWordGameChannel.send(`CONTEXT: I heard ${member.displayName} mutter the following: "` + transcript + "\"");
            		
            		client.secretWordGameWord = "";
            		client.secretWordGame = false;

                    client.secretWordGameChannel.send("Context: " + transcript);

                    client.secretWordGameWord = "";
                    client.secretWordGame = false;

                    await playChad.playCelebration(member.voice.channel);
                }
            }
        }
    });

    ws.on('close', function close() {
        //console.log("In websocket 'close' callback...");
        //process.exit()
    });
    ws.on('error', function error(err) {
        console.log("websocket ERROR callback.  error=" + err);
    });
    

    // const requestConfig = {
    //     encoding: 'LINEAR16',
    //     sampleRateHertz: 48000,
    //     languageCode: 'en-US'
    // };
    // const request = {
    //     config: requestConfig
    // };
    // const recognizeStream = googleSpeechClient
    //     .streamingRecognize(request)
    //     .on('error', console.error)
    //     .on('data', async response => {
    //         const transcription = response.results
    //             .map(result => result.alternatives[0].transcript)
    //             .join('\n')
    //             .toLowerCase();

    console.log(`Transcript: ${transcript}`);

    // //play an audio file if keyword is detected
    // if (client.okEnabled == true) {
    //     if (transcript.includes("okay")) {
    //         console.log(`I just heard ${member.displayName} say OK!  Calling playChad)...`);
    //         await playChad.playChad(member.voice.channel, 1);
    //     }
    // }

    // if (client.secretWordGame == true) {
    //     //console.log("looking for secret word: " + client.secretWordGameWord);
    //     if (transcript.includes(client.secretWordGameWord)) {
    //         client.secretWordGameChannel.send("OMG you said the secret word!  It was: " + client.secretWordGameWord);
    //         client.secretWordGameChannel.send(`${member.displayName} was the winner!`);
  
    //         client.secretWordGameChannel.send("Context: " + transcript);
                
    //         client.secretWordGameWord = "";
    //         client.secretWordGame = false;

    //         await playChad.playCelebration(member.voice.channel);
    //     }
    // }

    // const convertTo1ChannelStream = new ConvertTo1ChannelStream();

    // audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream);

    // audioStream.on('end', async () => {
    //     console.log(`I'm done listening to ${member.displayName}`);
    // })
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

const appendChunkToFile = (fileName) => {
    const pathToFile = `${fileName}.pcm`;
    //fs.unlinkSync(pathToFile);
    return fs.createWriteStream(pathToFile, { flags: 'a' });
};