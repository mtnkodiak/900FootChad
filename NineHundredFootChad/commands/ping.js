module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, client) {
		message.channel.send('Pong.');
	},
};