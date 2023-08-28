const express = require('express');

// Session
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const FileStore = require('session-file-store')(session);

// Security
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const fileUpload = require('express-fileupload');

// Other
const path = require('path');
require('dotenv').config();

// Files
const routes = require('./routes/routes');
const { connectToDatabase } = require('./database/db');


// Consts
const PORT = process.env.PORT || 3000;
const app = express()


app.set("view engine", 'ejs'); // Use ejs engine

// User session
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true, // Save session if unmodified
	saveUninitialized: true, // Create session until something stored
	store: new FileStore({
		path: path.join(require('os').tmpdir(), 'sessions'),
		// path: path.join(__dirname, 'sessions'), // Local
		retries: 5
	}),
	cookie: {
		maxAge: 7 * 24 * 60 * 60 * 1000, // (7 days) => Day, Hour, Minute, Second, Miliseconds (because this time is in miliseconds)
		secure: false, // true
		httpOnly: false,
		sameSite: 'strict'
	}
	// store: new MongoStore({
	// 	mongooseConnection: mongoose.connection,
	// 	ttl: 365 * 24 * 60 * 60, // = 365 days.
	// }),
}));



/* Session */
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


/* Security */
app.use(cors()); // Ver isso depois
app.use(morgan("dev"));
// app.use(helmet());

/* File upload */
app.use(fileUpload({
	limits: { fileSize: 10 * 1024 * 1024 } // 10MB -> Mega, Kilobyte, Byte
}));


/* Upload form */
app.use(express.static(path.join(__dirname, 'public'))); // Get static files (from public/)
app.use(express.urlencoded({ extended: true })); // Receive data from form
// app.use(cookieParser()); // Cookies

/* MIDDLEWARES */
app.all('*', (req, res, next) => {
	let securePaths   = ['/', '/makepost', '/postinteraction', '/logout____', '/user/*', '/configs', '/updateprofile'], // Can only acess if logged
		loginPaths    = ['/login', '/signup', '/dologin', '/dosignup'], // Can only acess if not logged
		authenticated = req.isAuthenticated();

	console.log("MIDDLEWARE =>", req.path, authenticated)
	// if(securePaths.includes(req.path) && !authenticated) {
	// 	console.log("=> MANDANDO PARA PAGINA DE LOGIN")
	// 	return res.redirect('/login');
	// } else if(loginPaths.includes(req.path) && authenticated) {
	if(loginPaths.includes(req.path) && authenticated) {
		console.log("=> MANDANDO PARA PAGINA INICIAL")
		return res.redirect('/');
	} else if(!loginPaths.includes(req.path) && !authenticated) { // If not loginPath, is a secure path
		console.log("=> MANDANDO PARA PAGINA DE LOGIN")
		return res.redirect('/login');
	}
	// else if(!authenticated) return res.redirect('/login');

	next(); // Necessary otherwhise won't work
});

// Error Handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = (req.app.get('env') === 'development') ? err : {};

	// render the error page
	console.log(err);
	res.status(err.status || 500);
	res.render('error');
});



// This NEEDS to stay after the  middlewares
app.use(routes); // Use routes from routes/

// Run
app.listen(PORT, async () => {
	await connectToDatabase(() => console.log("-> Database Connected!"))
	console.log("Listening on http://127.0.0.1:8080")
});

