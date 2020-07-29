async function startTalk(member, speaking) {

	const getvc = require('./getvc.js');

	if (speaking) {
		const vc = await this.getvc(message.member);
		console.log("got vc=", vc);
		const audio = vc.receiver.createStream(user, { mode: 'pcm' });

		console.log(member.displayName + ' started talking.');
	}
	else {
		console.log(member.displayName + ' stopped talking');
	}
};

module.exports = { startTalk };
