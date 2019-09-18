const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 3000
const ImageSearchAPIClient = require('azure-cognitiveservices-imagesearch');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'))

//app.get('/', (req, res) => res.send('Hello World!'))


let nl = async (text) => {
	// Imports the Google Cloud client library
	const language = require('@google-cloud/language');

	// Instantiates a client
	const client = new language.LanguageServiceClient();

	// The text to analyze
	//const text = 'Hello, world!';

	const document = {
		content: text,
		type: 'PLAIN_TEXT',
	};

	console.log(document);

	return await client.annotateText({
		document: document, features: {
			"extractSyntax": true,
			"extractEntities": true,
			"extractDocumentSentiment": true,
			"extractEntitySentiment": true,
			"classifyText": false
		}
	});

	// Detects the sentiment of the text
// 	const [sentiments] = await client.analyzeSentiment({document: document});
// 	const [entities] = await client.analyzeEntities({document});
// 	const [syntax] = await client.analyzeSyntax({document});
//
// // Detects sentiment of entities in the document
// 	const [sent_of_entities] = await client.analyzeEntitySentiment({document});
// 	const e = sent_of_entities.entities;

	//return result;
	// return {
	// 	sentiments: sentiments,
	// 	entities: entities,
	// 	syntax: syntax,
	// 	entity_sentiment: e
	// }
	// console.log(result);
	// const sentiment = result.documentSentiment;
	//
	// console.log(`Text: ${text}`);
	// console.log(`Sentiment score: ${sentiment.score}`);
	// console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
	//res.send('ok')
}
//
// app.get('/test', (req, res) => {
// 	nl('Hello World!').then((r) => {
// 		res.json(r);
// 		console.log(r);
// 		res.send('OK');
// 	}).catch((e) => {
// 		res.send(e.message);
// 	})
// });


//replace this value with your valid subscription key.
let serviceKey = "dec300b824d04a528a884d1074dd23b2";

//the search term for the request
//let searchTerm = "canadian rockies";

//instantiate the image search client
let credentials = new CognitiveServicesCredentials(serviceKey);
let imageSearchApiClient = new ImageSearchAPIClient(credentials);

//a helper function to perform an async call to the Bing Image Search API
const sendQuery = async (searchTerm) => {
	return await imageSearchApiClient.imagesOperations.search(searchTerm);
};

app.post('/bing', async (req, res) => {
	console.log(req.body);
	sendQuery(req.body.text).then(imageResults => {
		if (imageResults == null) {
			console.log("No image results were found.");
		}
		else {
			console.log(`Total number of images returned: ${imageResults.value.length}`);
			let firstImageResult = imageResults.value[0];
			//display the details for the first image result. After running the application,
			//you can copy the resulting URLs from the console into your browser to view the image.
			console.log(`Total number of images found: ${imageResults.value.length}`);
			console.log(`Copy these URLs to view the first image returned:`);
			console.log(`First image thumbnail url: ${firstImageResult.thumbnailUrl}`);
			console.log(`First image content url: ${firstImageResult.contentUrl}`);
			res.json(imageResults);
		}
	})
		.catch(err => console.error(err))
});

app.post('/nl', async (req, res) => {
	console.log(req.body.text);
	nl(req.body).then((r) => {
		console.log(r);
		res.json(r);
	}).catch((e) => {
		console.log(e.message);
		res.status(500).send(e.message).end();
		//res.send(e.message).statusCode(500).end();
	})
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))