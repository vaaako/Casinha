const readThis = (read, index) => {
	if(read) return;

	$.ajax({
		url: "/readthis",
		method: "POST",
		data: { index: parseInt(index) },
		error: (error) => {
			console.error("Error: " + error.message);
		}
	});
}

const readAll = () => {
	$.ajax({
		url: "/readall",
		method: "POST",
		error: (error) => {
			console.error("Error: " + error.message);
		}
	}).done(() => window.location.href = '/mails');
}

const deleteAll = () => {
	$.ajax({
		url: "/deleteall",
		method: "POST",
		error: (error) => {
			console.error("Error: " + error.message);
		}
	}).done(() => window.location.href = '/mails');
}