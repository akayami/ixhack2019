from flask import Flask, render_template, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from logger import getlogger
import nltk
import sys
import timeit
import urllib.request
import json
import settings
import requests
from nltk.corpus import alpino as alp
from nltk.tag import UnigramTagger, BigramTagger

training_corpus = alp.tagged_sents()
unitagger = UnigramTagger(training_corpus)
bitagger = BigramTagger(training_corpus, backoff=unitagger)
pos_tag = bitagger.tag
logger = getlogger(__name__)

app = Flask(__name__, template_folder='html/templates', static_folder='html/static')
CORS(app)
socketio = SocketIO(app)
app.debug = False

@app.route('/')

def index():
    return render_template('test4nl.html')

def query_pixabay(nouns):
    if nouns:
        q = 3
        nNouns = len(nouns)
        if nNouns > 4:
            nNouns = 4
        pics = {}
        for i in range(0,nNouns):
            query = nouns[i]
            url = 'https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&lang=nl&orientation=horizontal&safesearch=true&per_page=' + str(q) + '&q=' + urllib.parse.quote(query)
            response = requests.get(url)
            results = response.json()
            pics[query] = []
            for j in range(0,q):
                try:
                    picture = results['hits'][j]
                    pics[query].append(picture['webformatURL'])
                except Exception as ex:
                    print(ex)
                    pass
        print(pics)
        return pics

@app.route('/testget', methods=['GET'])
def testget():
    text = request.args.get('text')
    print(text)
    return ''

@socketio.on('text')
def handle_message(message):
    handle_message_noun_phrases(message)

def handle_message_noun_phrases(message):
    txt = message['data']
    # txt='Nederlands is een leuke taal om jou programma mee te testen.'
    print(txt)
    begin_time = timeit.timeit()

    tokenized = nltk.word_tokenize(txt)
    tagged = pos_tag(tokenized)
    tagged_translated = []
    for t in tagged:
        if t[1] is None:
            tagged_translated.append((t[0],'noun'))
        else:
            tagged_translated.append(t)

    print(tagged)
    print(tagged_translated)
    grammar = """
        NP: {<adj>*<noun>}
        {<None>}
    """

    cp = nltk.RegexpParser(grammar)
    print(cp)
    parsed = cp.parse(tagged_translated)
    print(parsed)
    noun_phrases_list = [' '.join(leaf[0] for leaf in tree.leaves())
                         for tree in parsed.subtrees()
                         if tree.label() == 'NP']
    print(noun_phrases_list)
    end_time = timeit.timeit()
    print(end_time - begin_time)
    sys.stdout.flush()
    socketio.emit('text', noun_phrases_list)
    pics = query_pixabay(noun_phrases_list)
    if pics:
        socketio.emit('pics', pics)


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))

if __name__ == '__main__':
    logger.debug("start")
    # socketio.run(app, host='10.51.104.226', debug=True)
    socketio.run(app, debug=False, port=8050)
