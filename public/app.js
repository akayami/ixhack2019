var elementCount = 0;

$(document).ready(async function(){
	for (i = 0; i < 10; i++) {
		// Random initial y coordinate between 0 and 80 % of view height
		var newY = parseInt(Math.random() * 8) * 10;
		// Random height between 200 and 600
		var newH = 200 + parseInt(Math.random() * 4) * 100;

		var newElement = createImage(newY, newH, "https://s.abcnews.com/images/Lifestyle/puppy-ht-3-er-170907_4x3_992.jpg");
		animateElement(newElement);
		await sleep(1000);
	}
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function createImage(y, height, src) {
	elementCount++;
	var newID = "thing" + elementCount;

	var div = $('<div>');
	div.attr("id", newID);
	div.attr("z-index", elementCount);
	div.appendTo("body");
	
	var img = $('<img class="movable' + y + '">');
	img.attr('src', src);
	img.attr("height", height);
	img.appendTo("#" + newID);

	return newID;
}

function animateElement(id) {
	$("#" + id).addClass("flier");
  
	$("#" + id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		$(this).remove();
	});
}