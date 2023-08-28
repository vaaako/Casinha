const User = require('../models/User');

const MIN_NAME_LENGTH = 4;
const MAX_NAME_LENGTH = 25;

const MIN_BIO_LENGTH = 4;
const MAX_BIO_LENGTH = 200;

const isNicknameValid = (nickname) => nickname.length >= MIN_NAME_LENGTH && nickname.length <= MAX_NAME_LENGTH;
const isUsernameValid = (username) => /^[A-Za-z0-9_]+$/g.test(username) && username.length >= MIN_NAME_LENGTH && username.length <= MAX_NAME_LENGTH;
const isEmailValid    = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
const isPasswordValid = (password, confirmpword) => password == confirmpword && password.length > 8;
const isBioValid = (bio) => bio.length >= MIN_BIO_LENGTH && bio.length <= MAX_BIO_LENGTH;


const USERNAME_ERROR_MESSAGE = `Username must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters and can only contain Alphanumeric and _`;
const NICKNAME_ERROR_MESSAGE = `Nickname must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`;
const PASSWORD_ERROR_MESSAGE = "Password must has at least 8 characters!";
const EMAIL_ERROR_MESSAGE    = "Email invalid!";
const BIO_ERROR_MESSAGE = `Bio must be between ${MIN_BIO_LENGTH} and ${MAX_BIO_LENGTH} characters`;

const USERNAME_INUSE_ERROR_MESSAGE = "This username is alredy in use, please choose another one";
const EMAIL_INUSE_ERROR_MESSAGE = "This email is alredy in use, try to log in";

const errorMessages = {
	'username': USERNAME_ERROR_MESSAGE,
	'nickname': NICKNAME_ERROR_MESSAGE,
	'password': PASSWORD_ERROR_MESSAGE,
	'email': EMAIL_ERROR_MESSAGE,
	'bio': BIO_ERROR_MESSAGE,

	"username-inuse": USERNAME_INUSE_ERROR_MESSAGE,
	"email-inuse": EMAIL_INUSE_ERROR_MESSAGE
}

const validAll = (username, email, password, confirmpword) => {
	if(!isUsernameValid(username)) // Test username 
		return USERNAME_ERROR_MESSAGE;
	else if(!isEmailValid(email)) // Test Email
		return EMAIL_ERROR_MESSAGE;
	else if(!isPasswordValid(password, confirmpword)) // Test password
		return PASSWORD_ERROR_MESSAGE;
	return null; // No errors
}

const usernameIsInUse = async (username) => {
	if(await User.findOne({ username: username })) return USERNAME_INUSE_ERROR_MESSAGE;
	return null; // No error
}

const emailIsInUse = async (email) => {
	if(await User.findOne({ email: email })) return EMAIL_INUSE_ERROR_MESSAGE;
	return null; // No error
}


const isPostValid = (req, user) => {
	let { post } = req.body
	// Check errors
	if(!req.body || (!post && !req.files)) return "You need to type or upload something!";
	else if(!user) return "User don't exist";
	else if(post.length > 300) return "The character limit is 300 characters";
}

const isMediaValid = (files, extension) => {
	// Media possible errors
	if(!files || Object.keys(files).length === 0)
		return "No files were uploaded.";
	else if(!['.png', '.jpg', '.jpeg', '.gif', '.mp4'].includes(extension)) // Supported extensions
		return "Supported extensions are png, jpg, jpeg, gif and mp4"
}

const getMediaExtension = (filename) => '.' + filename.split('.').pop()// Get last index because media can be "example.image.png"

const validateMedia = (files, reqname) => {
	if(files) {
		let sampleFile     = files[reqname]
		let mediaExtension = getMediaExtension(sampleFile.name);

		let isValid = isMediaValid(files, mediaExtension);
		if(isValid) return isValid; // Returned error

		return { 
			sampleFile,
			extension: mediaExtension
		}
	}

	return undefined;
}


module.exports = {
	// Login
	isUsernameValid,
	isNicknameValid,
	isPasswordValid,
	isEmailValid,
	isBioValid,
	usernameIsInUse,
	emailIsInUse,
	validAll,

	// Post
	isPostValid,
	isMediaValid,
	getMediaExtension,
	validateMedia,

	// Messages
	errorMessages
}
