async function sendInteraction(postId, protocol, sum, message) {
	$.ajax({
		url: "/postinteraction",
		method: "POST",
		data: { postid: postId, protocol: protocol, sum: sum, message: `Protocol ${sum} ${protocol} to post ${postId}` },
		success: (res) => {
		},
		error: (error) => {
			console.error("Error: " + error.message);
		}
	});
}


const getPostId = (element) => element.parentElement.parentElement.parentElement.parentElement.getAttribute('data-post-id');
async function fillAndIncrease(iconElement, iconName) {
	let postId = getPostId(iconElement);

	let interactionName = iconElement.parentElement.getAttribute('data-interaction-name');
	if(interactionName == 'comment') return; // Do nothing if comment button

	let elementValue = iconElement.parentElement.querySelectorAll('span')[1];

	iconElement.classList.remove('bi-'+iconName);
	iconElement.classList.add('bi-'+iconName + '-fill');

	elementValue.innerHTML = parseInt(elementValue.innerHTML) + 1;

	await sendInteraction(postId, interactionName+'s', 1);
}

async function unfillAndDecrease(iconElement, iconName) {
	let postId = getPostId(iconElement);

	let interactionName = iconElement.parentElement.getAttribute('data-interaction-name');
	if(interactionName == 'comment') return; // Do nothing if comment button

	let elementValue = iconElement.parentElement.querySelectorAll('span')[1];

	iconElement.classList.remove('bi-'+iconName + '-fill');
	iconElement.classList.add('bi-'+iconName);

	elementValue.innerHTML = parseInt(elementValue.innerHTML) - 1;


	await sendInteraction(postId, interactionName+'s', -1);
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

