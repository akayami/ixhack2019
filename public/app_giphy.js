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
		//console.log(part);
		generate(part);
	};
	recognition.start()
});

function randomIntFromInterval(min, max) { // min included, max excluded
	return Math.floor(Math.random() * (max - min) + min);
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

function generate(input) {
	Promise.all([
		new Promise((resolve, reject) => {
			pixabay(input, (err, data) => {
				resolve(parsePixabay(err, data));
			});
		}),
		new Promise((resolve, reject) => {
			flicker(input, (err, data) => {
				resolve(parseFlicker(err, data));
			});
		}),
		new Promise((resolve, reject) => {
			giphy(input, (err, data) => {
				resolve(parseGiphy(err, data));
			});
		})
	]).then((values) => {
		console.log("all results", values);
		var all = [];
		for(var i = 0; i < values.length; i++) {
			//console.log(values[i]);
			for(var z = 0; z < values[i].length; z++) {
				var v = values[i][z];
				v.text = input;
				all.push(v);
			}
		}
		var output = [];
		var limit = all.length >= 3 ? 3 : all.length;
		for(var p = 0; p < limit; p++) {
			output.push(all[randomIntFromInterval(0, all.length)]);
		}
		addToDom(output);
//		console.log(output);

	}).catch((e) => {
		console.error(e);
	});
	// pixabay(input, parsePixabay);
	// flicker(input, parseFlicker);
}

function parseFlicker(err, data) {
	// console.log('Flicker lookup is done');
	console.log("Flickr data", data);
	let output = [];
	for (var i = 0; i < data.items.length; i++) {
		output.push({url: data.items[i].media.m});
	}
	return output;
}

function parsePixabay(err, input) {
	let output = [];
	console.log("Pixabay input", input);
	for (var i = 0; i < input.hits.length; i++) {
		output.push({url: input.hits[i].webformatURL});
	}
	return output;
}

function parseGiphy(err, input) {
	let output = [];
	console.log("Giphy request response", input);
	for (var i = 0; i < input.data.length; i++) {
		output.push({url: input.data[i].images.downsized.url});
	}
	return output;
}

function pixabay1(text, cb) {
	console.log('Sending to pixabay', text)
	var e = document.createElement('script');
	e.src = "https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&callback=parsePixabay&per_page=18&q=" + encodeURI(text) + "&lang=en&orientation=horizontal"
	document.getElementById('body').append(e);
	//return e;
}

function pixabay(text, cb) {
	console.log('Pixabay input', text);
	var url = "https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&callback=?&per_page=18&q=" + encodeURI(text) + "&lang=en&orientation=horizontal"
	$.getJSON(url)
		.done(function (data) {
			cb(null, data);
		})
}

function flicker(text, cb) {
	console.log('Flicker input', text);
	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
	$.getJSON(flickerAPI, {
		tags: text,
		tagmode: "any",
		format: "json"
	})
		.done(function (data) {
			cb(null, data);
		})
}

function giphy(text, cb) {
	console.log('Giphy input', text);
	var giphyAPIKey = "zIuz7wnC0wxLuIuyiLkLDDG2dJlH9yr1";
	var giphyAPI = "https://api.giphy.com/v1/gifs/search?api_key=" + encodeURI(giphyAPIKey) + "&q=" + encodeURI(text) + "&limit=3&offset=0&rating=G&lang=en";
	$.getJSON(giphyAPI)
		.done(function (data) {
			cb(null, data);
		})
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