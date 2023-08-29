const routes = require('express').Router();
const HomeController = require('../controller/HomeController');
const LoginController = require('../controller/LoginController');
const UserController = require('../controller/UserController');
const ConfigController = require('../controller/ConfigController');
const OtherController = require('../controller/OtherController');
const PostController = require('../controller/PostController');
const MailController = require('../controller/MailController');

/* Homepage */
routes.get('/', HomeController.homePage);
routes.post('/makepost', HomeController.makePost);
routes.post('/postinteraction', HomeController.postInteraction);

/* Post page */
routes.get('/post/:postid', PostController.postPage);
routes.post('/comment/:postid', PostController.makeComment);

/* Login and Sign up page */
routes.get('/login', LoginController.loginGET);
routes.post('/dologin', passport.authenticate('local', {
	successReturnToOrRedirect: '/',
	failureRedirect: '/login',
	failureMessage: true
}));

routes.get('/signup', LoginController.signup);
routes.post('/dosignup', LoginController.createUser);

routes.get('/logout', LoginController.doLogout);

routes.get('/configs', ConfigController.configPage);
routes.post('/updateprofile', ConfigController.updateProfile);


routes.post('/loadmore', OtherController.loadMore);

/* Notifications Page */
routes.get('/mails', MailController.mailPage);

/* User page */
//-> It needs to stay in the end, otherwhise the other routes would be indentified as that
// routes.get('/user/:userid', UserController.userPage);
routes.get('/:username', UserController.userPage);

/* Anything else */
routes.get('*', OtherController.notfound);





// Export all routes
module.exports = routes;