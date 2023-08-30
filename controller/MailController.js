const { formatMail } = require("../database/dataManipulation");
const User = require("../models/User");

const mailPage = async (req, res) => {
	let user  = req.user;
	let mails = await User.findOne({ pubid: user.id })
	.select('mails').lean();

	let formattedMails = await formatMail(mails.mails.reverse());
	return res.render('mail', { user, mails: formattedMails }); // Send reverse order (newer -> older)
};

const readThis = async (req, res) => {
	try {
		let { index } = req.body;
		if(!index) throw new Error("Bad request!");

		let mails = await User.findOne({ pubid: req.user.id }).select('mails');

		let mail = mails.mails[index];
		if(!mail) throw new Error("Mail don't exist!")

		mail.read = true;
		mails.markModified('mails');
		await mails.save();

		// console.log(mails.mails[index])

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