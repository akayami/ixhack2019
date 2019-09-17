const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 3000

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'))

//app.get('/', (req, res) => res.send('Hello World!'))


let nl = async(text) => {
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

//	console.log(document);

	// Detects the sentiment of the text
	const [sentiments] = await client.analyzeSentiment({document: document});
	const [entities] = await client.analyzeEntities({document});
	const [syntax] = await client.analyzeSyntax({document});

// Detects sentiment of entities in the document
	const [sent_of_entities] = await client.analyzeEntitySentiment({document});
	const e = sent_of_entities.entities;

	//return result;
	return {
		sentiments: sentiments,
		entities: entities,
		syntax: syntax,
		entity_sentiment: e
	}
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

app.post('/nl', async (req, res) => {
	//console.log(req.body);
	nl(req.body).then((r) => {
		res.json(r);
	}).catch((e) => {
		console.log(e.message);
		res.send(e.message).statusCode(500).end();
	})
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))