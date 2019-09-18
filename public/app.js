var elementCount = 0;

$(document).ready(async function(){

	var f = document.getElementById('body');

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = false;
	//var output = document.getElementById('output');
	recognition.onresult = function (event) {
		var o = [];
		for (var i = 0; i < event.results.length; i++) {
			o.push(event.results[i][0].transcript);
		}
		var part = o.pop();
		console.log(part);
		f.append(generate(part));
	};
	recognition.start()
});

async function addToDom(picJSON) {
//	console.log(picJSON)
	for (var i = 0; i < (picJSON.hits.length >= 3 ? 3 : picJSON.hits.length); i++) {
		var newY = parseInt(Math.random() * 8) * 10;
		// Random height between 200 and 600
		var newH = 200 + parseInt(Math.random() * 4) * 100;

		var newElement = createImage(newY, newH, picJSON.hits[i].webformatURL);
		animateElement(newElement);
		await sleep(1000);
	}
}

function generate(input) {
	var e = document.createElement('script');
	e.src = "https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&callback=addToDom&per_page=18&q=" + encodeURI(input) + "&lang=en&orientation=horizontal"
	return e;
}

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