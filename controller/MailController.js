const User = require("../models/User");

const mailPage = async (req, res) => {
	let user  = req.user;
	let mails = await User.findOne({ pubid: user.id }).select('mails');
	return res.render('mail', { user, mails });
};

module.exports = {
	mailPage
}