var elementCount = 0;
var textVisible = true;

$(document).ready(async function(){

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


		// Natural language logic using google. Does not relly work
		// naturalLanguage(part, (err, output) => {
		// 	if(err) {
		// 		console.log(err);
		// 	} else {
		// 		console.log(output);
		// 	}
		// });

 		queryBing(part, (err, output) => {
			if(err) {
				console.log(err);
			} else {
				var o = [];
				console.log(output.value);
				for(var i = 0; i < output.value.length; i++) {
					o.push({
						url: output.value[i].contentUrl,
						text: part
					})
				}
				addToDom(o);
			}
		});
		//console.log(part);

	};
	recognition.start()
});

function naturalLanguage(text, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/nl", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 200) {
			var data = JSON.parse(this.responseText);
			cb(null, data);
			//console.log(data);
			// we get the returned data
		} else {
			cb(new Error('Error occured'));
		}
		// end of state change: it can be after some time (async)
	};
	xhr.send(JSON.stringify({
		text: text
	}));
}


function queryBing(text, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/bing", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 200) {
			var data = JSON.parse(this.responseText);
			cb(null, data);
			//console.log(data);
			// we get the returned data
		} else {
			cb(new Error('Error occured'));
		}
		// end of state change: it can be after some time (async)
	};
	xhr.send(JSON.stringify({
		text: text
	}));
}

function randomIntFromInterval(min, max) { // min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

async function addToDom(list) {
//	console.log(picJSON)
	for (var i = 0; i < (list.length >= 3 ? 3 : list.length); i++) {
		var newY = parseInt(Math.random() * 8) * 10;
		// Random height between 200 and 600
		var newH = 200 + parseInt(Math.random() * 4) * 100;

		var newElement = createImage(newY, newH, list[i].url, list[i].text);
		animateElement(newElement);
		await sleep(1000);
	}
}

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