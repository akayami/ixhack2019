from flask import Flask, render_template, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from logger import getlogger
from settings import Settings
import nltk
from flickrapi import FlickrAPI
import sys
import timeit
import urllib.request
import json

logger = getlogger(__name__)
settings = Settings

app = Flask(__name__, template_folder='html/templates', static_folder='html/static')

CORS(app)

socketio = SocketIO(app)
app.debug = False

flickr = FlickrAPI('c6a2c45591d4973ff525042472446ca2', '202ffe6f387ce29b', format='parsed-json')


@app.route('/nltk', methods=['POST'])
def nltk_process():
    ''' Entry point for Natural Language Processing
        Use process_nouns(..) as template
        returns array[string]
    '''

    if request.method == 'POST':
        text = (request.json['text'])

        print("IN: {}".format(text))

        # NLP PLUGIN: use process_nouns(..) function as example and modify, then plug-in below
        result = process_nouns(text)  # extract nouns; can add other functions to extract adjectives, phrases etc

        # Clean-up result
        result = remove_duplicates(result)  # remove duplicate words
        result = [r for r in result if len(r) > 2]  # remove words shorter than 2 chars

        print("OUT: [{}]".format(",".join(result)))

        # NLP done, return array[string]
        return json.dumps(result)


def process_nouns(text):
    ''' Template function for NLTK, copy, rename and add your changes,
        NN stands for NOUN in nltk
        must return array[string] '''

    is_noun = lambda pos: pos[:2] == 'NN'
    tokenized = nltk.word_tokenize(str(text))
    nouns = [word for (word, pos) in nltk.pos_tag(tokenized) if is_noun(pos)]
    return nouns


def remove_duplicates(data):
    return list(dict.fromkeys(data))


@app.route('/')
def index():
    return render_template('test1.html')


def query_pixabay(nouns):
    if nouns:
        q = 3
        nNouns = len(nouns)
        if nNouns > 4:
            nNouns = 4
        pics = {}
        for i in range(0, nNouns):
            query = nouns[i]
            url = 'https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&lang=en&orientation=horizontal&safesearch=true&per_page=' + str(
                q) + '&q=' + urllib.parse.quote(query)
            response = requests.get(url)
            results = response.json()
            pics[query] = []
            for j in range(0, q):
                try:
                    picture = results['hits'][j]
                    pics[query].append(picture['webformatURL'])
                except Exception as ex:
                    print(ex)
                    pass
        print(pics)
        return pics


@app.route('/test3')
def test3():
    return render_template('test3.html')


@app.route('/chuck')
def chuck():
    return render_template('chuck.html')


@app.route('/testget', methods=['GET'])
def testget():
    text = request.args.get('text')
    print(text)
    return ''


def query_flickr(nouns):
    if nouns:
        extras = 'url_c'
        query = " ".join(nouns)
        print("query= " + query)
        max = 9
        results = flickr.photos.search(text=query, per_page=max, extras=extras)
        pics = []

        for i in range(0, max):
            try:
                pics.append(results['photos']['photo'][i]['url_c'])
                print(pics)
            except Exception as ex:
                pass
        return pics


def query_pexels(nouns):
    # query = " ".join(nouns)
    pics = []
    if nouns:
        for i in range(0, 3):
            try:
                query = nouns[i]
                link = "https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&per_page=12&q={}&lang=en&orientation=horizontal".format(
                    query)
                contents = urllib.request.urlopen(link).read()
                j = json.loads(contents.decode('utf-8'))
                for i in range(0, 5):
                    print(j['hits'][i]['largeImageURL'])
                    pics.append(j['hits'][i]['largeImageURL'])
            except Exception as ex:
                pass
    return pics


@socketio.on('text')
def handle_message(message):
    handle_message_nouns(message)  # works with /test3
    # handle_message_noun_phrases(message)      # Sasha
    # process_text(message)  # Paul's stuff


def process_text(text):
    logger.info(text)
    settings.parseText(text)
    socketio.emit('word_array', ['word1', 'word2'])
    socketio.emit('settings', settings.getSettings())


def handle_message_nouns(message):
    txt = message['data']
    print(txt)
    is_noun = lambda pos: pos[:2] == 'NN'
    tokenized = nltk.word_tokenize(txt)
    nouns = [word for (word, pos) in nltk.pos_tag(tokenized) if is_noun(pos)]
    socketio.emit('text', nouns)

    # pics = query_flickr(nouns)
    pics = query_pexels(nouns)

    if pics:
        socketio.emit('pics', pics)


def handle_message_noun_phrases(message):
    # txt = message['data']
    txt = message
    print(txt)
    begin_time = timeit.timeit()

    tokenized = nltk.word_tokenize(txt)
    tagged = nltk.pos_tag(tokenized)
    grammar = "NP: {<DT>?<JJ.*|JJ.>*<NN\w?>}"

    cp = nltk.RegexpParser(grammar)
    parsed = cp.parse(tagged)
    print(parsed)
    noun_phrases_list = [' '.join(leaf[0] for leaf in tree.leaves())
                         for tree in parsed.subtrees()
                         if tree.label() == 'NP']

    return noun_phrases_list
    # print(noun_phrases_list)
    # end_time = timeit.timeit()
    # print(end_time - begin_time)
    # sys.stdout.flush()
    # socketio.emit('text', noun_phrases_list)


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


if __name__ == '__main__':
    logger.debug("start")
    query_pexels('')
    # socketio.run(app, host='10.51.104.226', debug=True)
    socketio.run(app, debug=False)
