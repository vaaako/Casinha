async function sendReaction(postId, reaction, sum) {
	$.ajax({
		url: "/postreaction",
		method: "POST",
		data: { postid: postId, reaction: reaction, sum: sum, message: `Reaction ${sum} ${reaction} to post ${postId}` },
		error: (error) => {
			console.error("Error: " + error.message);
		}
	});
}


const getPostId = (element) => element.parentElement.parentElement.parentElement.parentElement.getAttribute('data-post-id');
// const getPostId = (element) => element.parentElement.parentElement.parentElement.parentElement.id;
async function fillAndIncrease(iconElement, iconName) {
	let postId = getPostId(iconElement);

	let reactionName = iconElement.parentElement.getAttribute('data-reaction-name');
	if(reactionName == 'comment') return; // Do nothing if comment button

	let elementValue = iconElement.parentElement.querySelectorAll('span')[1];

	iconElement.classList.remove('bi-'+iconName);
	iconElement.classList.add('bi-'+iconName + '-fill');

	elementValue.innerHTML = parseInt(elementValue.innerHTML) + 1;

	await sendReaction(postId, reactionName, 1);
}

async function unfillAndDecrease(iconElement, iconName) {
	let postId = getPostId(iconElement);

	let reactionName = iconElement.parentElement.getAttribute('data-reaction-name');
	if(reactionName == 'comment') return; // Do nothing if comment button

	let elementValue = iconElement.parentElement.querySelectorAll('span')[1];

	iconElement.classList.remove('bi-'+iconName + '-fill');
	iconElement.classList.add('bi-'+iconName);

	elementValue.innerHTML = parseInt(elementValue.innerHTML) - 1;


	await sendReaction(postId, reactionName, -1);
}


async function likePost(element) {
	let buttons = element.querySelectorAll('span'),
		iconElement  = buttons[0],
		isLiked = iconElement.className.includes('fill');

	if(isLiked) {
		unfillAndDecrease(iconElement, 'star');
	} else {
		let dislikeButton = element.parentElement
			.getElementsByClassName('dislike-button')[0]
			.querySelectorAll('span')[0];
	
		// If dislike is clicked, remove dislike
		if(dislikeButton.className.includes('fill')) unfillAndDecrease(dislikeButton, 'pentagon');

		fillAndIncrease(iconElement, 'star');
	}
}

async function dislikePost(element) {
	let buttons = element.querySelectorAll('span'),
		iconElement  = buttons[0],
		isDisliked = iconElement.className.includes('fill');


	if(isDisliked) {
		unfillAndDecrease(iconElement, 'pentagon');
	} else {
		let likeButton = element.parentElement
			.getElementsByClassName('like-button')[0]
			.querySelectorAll('span')[0];

		// If like is clicked, remove like
		if(likeButton.className.includes('fill')) unfillAndDecrease(likeButton, 'star');
		
		fillAndIncrease(iconElement, 'pentagon');
	}
}

async function commentPost(element) {
	alert("Funcionalidade inexistente ainda!");
}

