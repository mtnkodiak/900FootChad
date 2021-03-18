/**
 * http://usejsdoc.org/
 */
const config = require('config');
module.exports = async (client) => {
    //console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
    console.info(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    console.info(`Logged in as ${client.user.tag}!`);

    await client.user.setActivity("my testbits", {type: "WATCHING"})

    // const guild = client.guilds.cache.get("149664473240698880");
    // if (!guild) {
    //     throw new Error('Cannot find guild.')
    // }
    // const voiceChannel = guild.channels.cache.find(ch => {
    //     return ch.name === client.config.voiceChannelName && ch.type === 'voice'
    // });
    // if (!voiceChannel) {
    //     throw new Error('Cannot find voice channel.')
    // }
    // console.log(`Voice channel: ${voiceChannel.id} ${voiceChannel.name}`);

    // const textChannel = guild.channels.cache.find(ch => {
    //     return ch.name === client.config.textChannelName && ch.type === 'text'
    // });
    // if (!textChannel) {
    //     throw new Error('Cannot find text channel.')
    // }
    // console.log(`Text channel: ${textChannel.id} ${textChannel.name}`);

    // client.voiceConnection = await voiceChannel.join();

};
