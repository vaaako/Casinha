// Instead could be a <a> that sends to /like/postid and /dislike/postid
function autogrow(element) {
	element.style.height = "5px";
	element.style.height = (element.scrollHeight) + "px";
}

let postform = document.getElementById('postform');
let postarea = document.getElementById('postarea');
postform.addEventListener('submit', (e) => {
	e.preventDefault(); // Prevent the form from submitting

	if(postarea.length > 300)
		return alert("You can only type 300 characters")
	else return postform.submit();
});




