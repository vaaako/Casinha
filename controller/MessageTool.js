var messages = []
const storeMessage = (message, type='error') => { // Error and Sucess
	// Store message in req.session.messages to use later
	// req.session.messages = req.session.messages || [];
	// req.session.messages.push(message);

	messages.push({ message: message, type: type });
}

const getMessage = () => {
	// If have, get message from req.session.messages
	// let message = req.session.messages[0] || [];
	// req.session.messages = []; // Reset
	// return message

	let message = messages[0] || [];
	messages = [];
	return message; 
}


module.exports = {
	storeMessage,
	getMessage
}