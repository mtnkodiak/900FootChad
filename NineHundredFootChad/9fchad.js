require('dotenv').config();
const config = require('./config');
const Discord = require('discord.js');
const Vosk = require('vosk-js');
const fs = require('fs');
const Enmap = require("enmap");
const { exit } = require('process');
const discordClient = new Discord.Client();

// read in all of our configurations 
discordClient.config = config;

discordClient.commands = new Discord.Collection(); // Collection for all commands

// link all the events
// explanation for how this works can be found here:
// https://anidiots.guide/first-bot/a-basic-command-handler
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        discordClient.on(eventName, event.bind(null, discordClient));
        console.log("Read in event: " + eventName);
    });
});

//discordClient.commands = new Enmap();

// read in all the custom commands
fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let command = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        discordClient.commands.set(commandName, command);
        console.log("Read in command: " + commandName + " with props=" + command);
    });
});

try {
    console.log("Logging in...");
    console.log("with config.discordApiToken: " + config.discordApiToken);

    discordClient.login(config.discordApiToken);
    discordClient.secretWordGame = false;
    discordClient.okEnabled = true;


} catch (error) {
    console.log("Could not login!  Error: " + error);
    
}
