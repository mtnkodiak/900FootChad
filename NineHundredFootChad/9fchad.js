const Discord = require('discord.js');
const config = require('config');
const Vosk = require('vosk-js');
const fs = require('fs');
const Enmap = require("enmap");
const discordClient = new Discord.Client();

// read in all of our configurations 
discordClient.config = config;

discordClient.commands = new Discord.Collection(); // Collection for all commands

// link all the events
// explanation for how this works can be found here:
// https://anidiots.guide/first-bot/a-basic-command-handler
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    console.group("Reading Events:");
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        discordClient.on(eventName, event.bind(null, discordClient));
        console.log("Event: " + eventName);
    })
    console.groupEnd();
});

//discordClient.commands = new Enmap();

// read in all the custom commands
fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    console.group("Reading Custom Commands:");
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let command = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        discordClient.commands.set(commandName, command);
        console.log("Command: " + commandName + " with props=" + command);
    })
    console.groupEnd();
});

try {
    console.log("Logging in...");
    const apiToken = config.get('Chad.discordApiToken');
    discordClient.login(apiToken);
    discordClient.secretWordGame = false;
    discordClient.okEnabled = true;


} catch (error) {
    console.log("Could not login!  Error: " + error);
    
}