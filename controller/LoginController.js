const passport = require('passport');
const LocalStrategy = require('passport-local');
const { checkAndCreate } = require('../database/db');
const { validAll, isUsernameValid, usernameIsInUse, emailIsInUse, errorMessages, isPasswordValid, validUsernameAndPword } = require('../database/validator');
const { storeMessage, getMessage } = require('./MessageTool');
const User = require('../models/User');

const argon2 = require('argon2');

/** TO DO 
 * - All password requests must be encrypted
 * X Check if username exists
 * X Check if email exists
 * X Send message to log in page and color to green
 * 
 * */



/**
 * CHECKS
 * USERNAME => LENGTH (8-20), REGEX
 * PASSWORD => LENGTH (8), EQUALS
 * EMAIL    => REGEX
 * */


// Authenticates user
// passReqToCallback option to true. With this option enabled, req will be passed as the first argument to the verify callback
passport.use(new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
	// Post Login run this
	// Try to find user
	// This only will be an error if the user send manually request
	let errorMessage = validUsernameAndPword(username, password)
	if(errorMessage) return done(null, false, storeMessage(errorMessage));


	let user = await User.findOne({ username: username }).lean();

	// User not found
	if(!user) return done(null, false, storeMessage("User or password incorrect!"));

	// Verify hashed password
	let verify = await argon2.verify(user.password, password, {
		secret: Buffer.from(process.env.ARGON2_SECRET),
		type: argon2.argon2id
	});

	// Passwords don't match
	if(!verify) return done(null, false, storeMessage("User or password incorrect!"));

	// user.authenticate();
	return done(null, user)

}));


// User's session information is provided by serialize
passport.serializeUser((user, done) => {
	process.nextTick(() => {
		done(null, {
			id: user.pubid,
			username: user.username,
			nickname: user.nickname,
			bio: user.bio
		});
	});
});

// Deserialize
passport.deserializeUser((user, done) => {
	process.nextTick(() => {
		return done(null, user);
	});
});


const loginGET = async (req, res) => res.render('login', { message: getMessage() });
const signup = async (req, res) => res.render('signup', { message: getMessage() });



// Just in case
// 	console.log("LOGIN-POST =>", req.body);
// 	await passport.authenticate('local', {
// 		successReturnToOrRedirect: '/',
// 		failureRedirect: '/login',
// 		failureMessage: true,
// 		// failureFlash: true
// 	})
// 	console.log(req.session.messages)
// 	return res.redirect('/login')
// }


// Sign up page



// Create User
const createUser = async (req, res) => {
	try {
		// Check body
		if(!req.body) throw new Error("Bad request!");

		// Get fields
		const { username, password, confirmpword, email } = req.body;
		
		// Also verify fields in sever-side
		// This will only be invalid if the user change the HTML and JS validator
		let errorMessage = validAll(username, email, password, confirmpword)
			|| await usernameIsInUse(username) || await emailIsInUse(email)

		// If have erroMessage (had error)
		if(errorMessage) throw new Error(errorMessage);

		
		// Add entry (checking if have same ID) and removing confirmPword
		let entry = await checkAndCreate(User, {
			username: username,
			nickname: username,
			password: await argon2.hash(password, {
				secret: Buffer.from(process.env.ARGON2_SECRET),
				type: argon2.argon2id // Is a hybrid combination of argon2i and argonid, being resistant against GPU and tradeoff attacks
			}),
			email: email
		});
		await entry.save();

		// Confirmation message to Login page
		storeMessage("Account created with sucess!", 'sucess');
		return res.redirect('/login');
	} catch (err) {
		console.log("[ERR] SIGN UP => ", err);
		storeMessage(err); // Only happening if user send request manually
		return res.redirect('/signup');
	}
}

const doLogout = async (req, res, next) => {
	req.session.destroy((err) => res.redirect('/login'));

	// req.logout((err) => next(err));
	// return res.redirect('/login');
}



module.exports = {
	loginGET,
	// loginPOST,
	signup,
	createUser,
	doLogout
};