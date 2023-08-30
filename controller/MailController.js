const { timeAgo, formatContent } = require("../database/dataManipulation");
const User = require("../models/User");

const mailPage = async (req, res) => {
	let user  = req.user;
	let mails = await User.findOne({ pubid: user.id })
	.select('mails');
	mails = mails['mails']

	const authors = new Map();
	let mailAuthorIDs = mails.map((mail) => mail.from);
	const allAuthors = await User.find({ pubid: { $in: mailAuthorIDs } }); // Get all authors
	allAuthors.map((author) => authors.set(author.pubid, author));

	let index = 0;
	const modifiedMails = mails.map((mail) => {
		let author = authors.get(mail.from);
		let origin = (mail.details.type == 0)
			? "commented on "
			: mail.details.origin + 'd'; // like -> liked / dislike -> disliked

		return {
			postid: mail.postid,
			read: mail.read,
			index: index++, // Used to read a mail
			whoreacted: {
				id: author.pubid,
				username: author.username,
				nickname: author.nickname
			},
			formatedDate: timeAgo(mail.date),
			message: formatContent(`@${author.username} ${origin} your post`)
		}
	});

	return res.render('mail', { user, mails: modifiedMails.reverse() }); // Send reverse order (newer -> older)
};

const readThis = async (req, res) => {
	try {
		let { index } = req.body;
		if(!index) throw new Error("Bad request!");

		let mails = await User.findOne({ pubid: req.user.id });

		let mail = mails.mails[index];
		if(!mail) throw new Error("Mail don't exist!")

		mails.markModified('mails');
		mail.read = true;
		await mails.save();

		return res.status(200).send({ sucess: true, message: "Mail readed!" });
	} catch (err) {
		console.log("[ERR] MAKE POST => ", err);
		return res.status(401).send({ sucess: false, message: "Bad request!" });
	}
}

const readAll = async (req, res) => {
	let mails = await User.findOne({ pubid: req.user.id });
	for(const mail of mails.mails) {
		mail.read = true;
	}

	mails.markModified('mails');
	await mails.save();

	return res.status(200).send({ sucess: true, message: "All mails readed!" });
};

const deleteAll = async (req, res) => {
	let mails = await User.findOne({ pubid: req.user.id }).select('mails');
	mails.mails = [];

	mails.markModified('mails');
	await mails.save();

	return res.status(200).send({ sucess: true, message: "All mails deleted!" });
};

module.exports = {
	mailPage,
	readThis,
	readAll,
	deleteAll
}