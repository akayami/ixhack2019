var elementCount = 0;
var textVisible = false;

$(document).ready(async function(){
	for (i = 0; i < 10; i++) {
		// Random initial y coordinate between 0 and 80 % of view height
		var newY = parseInt(Math.random() * 8) * 10;
		// Random height between 200 and 600
		var newH = 200 + parseInt(Math.random() * 4) * 100;

		var newElement = createImage(newY, newH, "https://s.abcnews.com/images/Lifestyle/puppy-ht-3-er-170907_4x3_992.jpg", "puppy-"+newY);
		animateElement(newElement);
		await sleep(1000);
		if (elementCount % 4 == 0) {
			changeTextMode(!textVisible);
		}
	}
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function changeTextMode(textMode) {
	textVisible = textMode;

	applyCurrentTextVisibility($('.text'));
}

function applyCurrentTextVisibility(element) {
	if(textVisible) {
		element.css("visibility", "visible");
	} else {
		element.css("visibility", "hidden");
	}
}

function createImage(y, height, src, text) {
	var newID = "thing" + elementCount;

	var div = $('<div class="container movable' + y + '">');
	div.attr("id", newID);
	div.attr("z-index", elementCount);
	div.appendTo("#parent");

	var textDiv = $('<div id="textDiv" class="text top-right">' + text + '</div>');
	textDiv.attr("z-index", elementCount + 1);
	textDiv.appendTo("#" + newID);
	applyCurrentTextVisibility(textDiv);
	
	var img = $('<img>');
	img.attr('src', src);
	img.attr("height", height);
	img.appendTo("#" + newID);

	elementCount += 2;

	return newID;
}

function animateElement(id) {
	// $("#" + id).addClass("flier");
  
	$("#" + id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		$(this).remove();
	});
}