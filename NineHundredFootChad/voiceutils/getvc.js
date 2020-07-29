

async function getvc(member) {

	connection = await member.voice.channel.join();
	return connection;
}

module.exports = { getvc };

