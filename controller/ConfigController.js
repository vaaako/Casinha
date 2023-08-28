const { isBioValid, validateMedia, errorMessages, isNicknameValid } = require('../database/validator');
const { storeMessage, getMessage } = require('./MessageTool');

const User = require('../models/User');



const configPage = async (req, res) => {
	let user = req.user;
	return res.render('configs', { user, message: getMessage() });
};

const updateProfile = async (req, res) => {
	try {
		let { newnickname, newbio } = req.body;
		let user = await User.findOne({ pubid: req.user.id });
		let localuser = req.user;
		console.log("\n\nBODY =>", req.body)

		if(!newnickname && !newbio && !req.files) return res.redirect('/configs');

		let newpfp = validateMedia(req.files, 'newpfp');
		if(typeof newpfp == 'string') throw new Error(newpfp);

		let newbanner = validateMedia(req.files, 'newbanner');
		if(typeof newbanner == 'string') throw new Error(newbanner);


		if(newpfp) {
			await newpfp.sampleFile.mv('public/medias/pfp/' + localuser.id + '.png', (err) => {
				if(err) throw new Error(err);
			});
		}

		if(newbanner) {
			await newbanner.sampleFile.mv('public/medias/banners/' + localuser.id + '.png', (err) => {
				if(err) throw new Error(err);
			});
		}



		if(newnickname) {
			if(!isNicknameValid(newnickname)) throw new Error(errorMessages.nickname);

			user.nickname = newnickname;
			localuser.nickname = newnickname;
			await user.save();
		}

		if(newbio) {
			if(!isBioValid(newbio)) throw new Error(errorMessages.bio);

			user.bio = newbio;
			localuser.bio = newbio;
		}
		await user.save();

		storeMessage("Profile updated!", type='sucess');
		return res.redirect('/'+req.user.username);
	} catch (err) {
		console.log("[ERR] USER CONFIGS =>", err)
		storeMessage(err.message);
		return res.redirect('/configs');
	}
}

module.exports = {
	configPage,
	updateProfile
};