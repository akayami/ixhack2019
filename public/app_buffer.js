var elementCount = 0;
var textVisible = true;
var nextHeight = 0;

// add any memes here
var memeList = {
	"sun": "https://media.giphy.com/media/bihnwWzmlYHN6/giphy.gif",
	"fine": "https://static01.nyt.com/images/2016/08/05/us/05onfire1_xp/05onfire1_xp-jumbo-v2.jpg",
	"Chuck": "https://files.slack.com/files-pri/T0A6N8UG1-FN5MTMC5R/20190918_164605.jpg",
};

$(document).ready(async function(){
	// var list = [];
	// for (var i = 0; i < 3; i++) {
	// 	list.push({url: "https://media1.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif", text: "puppy gif" + i});
	// }
	// for (var i = 0; i < 15; i++) {
	// 	addToDom(list);
	// 	await sleep(2000);
	// }

	var buffer = [];
	var timeout = 3000;

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;
	//var output = document.getElementById('output');
	recognition.onresult = function (event) {
		var o = [];
		for (var i = 0; i < event.results.length; i++) {
			o.push(event.results[i][0].transcript);
		}
		var part = o.pop();
		buffer.push(part);
		//console.log(part);
		//generate(part);
	};
	recognition.start();

    naturalLanguage('some test', (err, res) => {
        if(err) console.error(err);
        console.log(res);
    })

	setInterval(() => {
		var block = [];
		while(buffer.length > 0) {
			block.push(buffer.shift());
		}
		var s = block.join(' ');
		if(s.length > 0) {
			naturalLanguage(s, (err, res) => {
				generate(res.join(' '));
			});
		}
	}, timeout)
});

function naturalLanguage(text, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:5000/nltk", true);
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


function randomIntFromInterval(min, max) { // min included, max excluded
	return Math.floor(Math.random() * (max - min) + min);
}

async function addToDom(list) {
	// console.log(picJSON)
	for (var i = 0; i < (list.length >= 3 ? 3 : list.length); i++) {
		// Random height between 200 and 600
		// var newH = 200 + parseInt(Math.random() * 4) * 100;
		var newH = (10 + parseInt(Math.random() * 6) * 10); // between 10 and 60
		console.log("This time, the y is: " + nextHeight + ", and the height will be: " + newH);

		var newElement = createImage(nextHeight, newH, list[i].url, list[i].text);
		nextHeight += (newH - (parseInt(Math.random() * 5))); // up to 5% overlap allowed

		if (nextHeight >= 90) {
			nextHeight = 0;
		}

		animateElement(newElement);
	}
}

function generate(input) {
	Promise.all([
		new Promise((resolve, reject) => {
			memes(input, (err, data) => {
				resolve(parseMemes(err, data));
			});
		}),
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
		var hardCodes = 0;
		for(var i = 0; i < values.length; i++) {
			//console.log(values[i]);
			for(var z = 0; z < values[i].length; z++) {
				var v = values[i][z];
				if (i == 0) {
					hardCodes++;
				} else {
					v.text = input;
				}
				all.push(v);
			}
		}
		var output = [];
		for(var p = 0; p < all.length; p++) {
			if (hardCodes > 0) {
				output.push(all[p]);
				hardCodes--;
			} else {
				output.push(all[randomIntFromInterval(0, all.length)]);
			}
		}
		console.log('length', output);
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

function parseMemes(err, input) {
	let output = [];
	for (var i = 0; i < input.length; i++) {
		output.push(input[i]);
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

function memes(text, cb) {
	console.log('Meme input', text);
	var result = [];
	for (var meme in memeList) {
		if (meme == text) {
			result.push({url: memeList[meme], text: meme});
		}
	}
	cb(null, result);
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

function createImage(yPercentage, heightPercentage, src, text) {
	var newID = "thing" + elementCount;

	var div = $('<div class="container movable' + yPercentage + '">');
	div.attr("id", newID);
	div.attr("z-index", elementCount);
	div.appendTo("#parent");

	var textDiv = $('<div id="textDiv" class="text top-right">' + text + '</div>');
	textDiv.attr("z-index", elementCount + 1);
	textDiv.appendTo("#" + newID);
	applyCurrentTextVisibility(textDiv);

	var img = $('<img>');
	img.attr('src', src);

	var height = heightPercentage / 100.0 * $( window ).height();
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