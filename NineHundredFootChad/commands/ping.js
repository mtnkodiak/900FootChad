exports.run = (client, message, args) => {
	console.log("Got PING command!");
	console.log("message = " + message);
    message.channel.send(`pong! ${args}`).catch(console.error);
};
exports.name = "ping";
