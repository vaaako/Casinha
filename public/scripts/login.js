const message = document.getElementById('login-error-message'),
	unameField = document.getElementById('username'),
	pwordField = document.getElementById('password'),
	confirmPwordField = document.getElementById('confirmpword'),
	emailField = document.getElementById('email'),
	loginButton = document.getElementById('login-button'),
	loginForm = document.getElementById('login-form');



/**
 * TO DO
 * - Instead of pword be a string it can be a parentClass.getElemnts[0] (is something like this idk)
 * 
 * */
function showPword(pword, eye) {
	let field = document.getElementById(pword);

	if(field.type === 'password') {
		field.type = 'text';

		eye.classList.remove('bi-eye');
		eye.classList.add('bi-eye-fill');
	} else {
		field.type = 'password';

		eye.classList.remove('bi-eye-fill');
		eye.classList.add('bi-eye');
	}
}


/**
 * 
 * 	TOOLS FUNCTIONS
 * 
 * */
const isRequired = (value) => value !== '';
const isBetween = (length, min, max) => length >= min && length <= max;


const isUsernameValid = (username) => /^[A-Za-z0-9_]+$/g.test(username);
const isEmailValid = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
// const isPasswordSecure = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[_\-!@#\$%\^&\*])(?=.{8,})/g.test(password);
const isPasswordSecure = (password) => password.length > 8;

const showError = (err) => {
	message.innerHTML = `<p class="error">${err}</p>`;
	// loginButton.disabled = true;

};

const cleanError = () => {
	message.innerHTML = '';
	// loginButton.disabled = true;

};






/**
 * 
 * CHECK FUNCTIONS
 * 
 * */
const checkUsername = () => {
	let valid = false,
		min = 4,
		max = 25;
	const username = unameField.value.trim();

	if(!isRequired(username))
		showError('Username cannot be blank');
	else if(!isBetween(username.length, min, max) || !isUsernameValid(username))
		showError(`Username must be between ${min} and ${max} characters and can only contain Alphanumeric and _`);
	else
		valid = true;

	return valid;
};

const checkEmail = () => {
	let valid = false;

	if(!emailField) return true; // Email field not found (login page)
	const email = emailField.value.trim();

	if(!isRequired(email))
		showError('Email cannot be blank');
	else if(!isEmailValid(email))
		showError('Email is not valid');
	else
		valid = true;
	return valid;
};

const checkPassword = () => {
	let valid = false;
	const password = pwordField.value.trim();

	if(!isRequired(password))
		showError('Password cannot be blank');
	else if(!isPasswordSecure(password))
		// showError('Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)');
		showError('Password must has at least 8 characters!');
	else
		valid = true;

	return valid;
};

const checkConfirmPassword = () => {
	let valid = false;

	if(!confirmPwordField) return true; // Confirm Password field not found (login page)
	const confirmPassword = confirmPwordField.value.trim();
	const password = pwordField.value.trim();

	if(!isRequired(confirmPassword))
		showError('Please enter the password again');
	else if (password !== confirmPassword)
		showError('Confirm password does not match');
	else
		valid = true;

	return valid;
};






/**
 * 
 * VALIDATE FORM
 * 
 * */

loginForm.addEventListener('submit', (e) => {
	e.preventDefault(); // Prevent the form from submitting


	// Confirm all again
	let isUsernameValid = checkUsername(),
		isEmailValid = checkEmail(),
		isPasswordValid = checkPassword(),
		isConfirmPasswordValid = checkConfirmPassword();

	let isFormValid = isUsernameValid &&
		isEmailValid &&
		isPasswordValid &&
		isConfirmPasswordValid;

	// Submit to the server if the form is valid
	if(isFormValid) return loginForm.submit();
});

// Check field after user stop typing and delay
const debounce = (fn, delay = 500) => {
	let timeoutId;
	return (...args) => {
		// Cancel the previous timer
		if(timeoutId) clearTimeout(timeoutId);
		// Setup a new timer
		timeoutId = setTimeout(() => {
			fn.apply(null, args)
		}, delay);
	};
};

loginForm.addEventListener('input', debounce((e) => {
	let valid = false;
	switch (e.target.id) {
		case 'username':
			valid = checkUsername()
			break;
		case 'email':
			valid = checkEmail()
			break;
		case 'password':
			valid = checkPassword()
			break;
		case 'confirmpword':
			valid = checkConfirmPassword()
			break;
	}
	if(valid) cleanError(); // If valid clean error message
}));

