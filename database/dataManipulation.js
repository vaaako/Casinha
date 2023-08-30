const User = require('../models/User');

const timeAgo = (timestamp) => {
	// Math.floor(current_date - provided_time / 100) -> ellapsed time in seconds
	let providedTime = new Date(timestamp).getTime();
	let ellapsedTime = Math.floor((new Date() - providedTime) / 1000);

	if (ellapsedTime < 60) {
		return ellapsedTime + " segs ago";

	} else if (ellapsedTime < 60 * 60) { // Les than 1 hour
		let minutes = Math.floor(ellapsedTime / 60);
		return `${minutes} ${(minutes === 1) ? 'min' : 'mins'} ago`;

	} else if (ellapsedTime < 24 * 60 * 60) { // Less than 24 hours (1 day)
		let hours = Math.floor(ellapsedTime / (60 * 60));
		return `${hours} ${(hours === 1) ? 'hour' : 'hours'} ago`;

	} else if (ellapsedTime < 7 * 24 * 60 * 60) { // Less than 7 days
		let days = Math.floor(ellapsedTime / 86400);
		return `${days} ${(days === 1) ? 'day' : 'days'} ago`;

	} else {
		return providedTime.toLocaleDateString();
	}

}

// const haveReaction = (userid, reactions) => {
// 	for(let i=0; i < reactions.length; i++) {
// 		if(reactions[i].userid == userid)
// 			return reactions[i].reaction;
// 	}
// 	return false;
// }

const haveReaction = (userid, reactions) => {
	const userReaction = reactions.find((reaction) => reaction.userid === userid);
	return (userReaction) ? userReaction.reaction : false;
};



function formatContent(content) {
	// Find >greentext and format
	// It needs to be the first one because it can match "<span>text</span>" as greentext
	content = content.replace(/>(.*)/g , (match) => '<span class="greentext">' + match + '</span>');

	// Find @user and format
	content = content.replace(/@\w+/g, (match) => `<a class="atuser" href="/${match.split('@')[1]}">` + match + '</a>');

	// Find #hashtag and format
	content = content.replace(/#\w+/g , (match) => '<span class="hashtag">' + match + '</span>');

	// Add line break
	content = content.replace(/\n/g, '<br>')

	return content;
}


async function formatPost(posts, userid) {
	const authors = new Map();
	let postAuthorIDs = posts.map((post) => post.author);
	const allAuthors = await User.find({ pubid: { $in: postAuthorIDs } }); // Get all authors
	allAuthors.forEach((author) => authors.set(author.pubid, author));

	const modifiedPostsPromise = posts.map(async (post) => { // sort, reverse
		const author = authors.get(post.author);
		const reactions = post.whoReacted;

		// Calc like and dislike
		const reactionCounts = reactions.reduce((acc, reaction) => {
			if(reaction.reaction === 'like')
				acc.likes++
			else if(reaction.reaction === 'dislike')
				acc.dislikes++;
			return acc;
		}, { likes: 0, dislikes: 0 });
		
		// Check if the object is a Mongoose document before calling .toObject()
		if(post.toObject) post = post.toObject();
		
		// return all
		return {
			...post,
			author: {
				id: post.author,
				username: author.username,
				nickname: author.nickname
			},
			content: formatContent(post.content),
			userReacted: haveReaction(userid, reactions), // If viewing user reacted to this post
			formatedDate: timeAgo(post.date),
			likes: reactionCounts.likes,
			dislikes: reactionCounts.dislikes,
			// totalcomments: post.comments.length
		};
	});


	const modifiedPosts = await Promise.all(modifiedPostsPromise)
	return modifiedPosts;
}


module.exports = {
	formatPost,
	timeAgo,
	formatContent
}