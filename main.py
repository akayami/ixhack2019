from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from logger import getlogger
import nltk
from flickrapi import FlickrAPI
import sys
import timeit
import urllib.request
import json

logger = getlogger(__name__)

app = Flask(__name__, template_folder='html/templates', static_folder='html/static')
socketio = SocketIO(app)
app.debug = False

flickr = FlickrAPI('c6a2c45591d4973ff525042472446ca2', '202ffe6f387ce29b', format='parsed-json')


@app.route('/')
def index():
    return render_template('test1.html')


@app.route('/test3')
def test3():
    return render_template('test3.html')


@app.route('/chuck')
def chuck():
    return render_template('chuck.html')


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
    if nouns:
        query = nouns[0]
        link = "https://pixabay.com/api/?key=13658839-11ca33364dfe1124291ae842d&per_page=36&q={}&lang=en&orientation=horizontal".format(
            query)
        contents = urllib.request.urlopen(link).read()
        j = json.loads(contents.decode('utf-8'))
        pics = []
        for i in range(0, 16):
            print(j['hits'][i]['largeImageURL'])
            pics.append(j['hits'][i]['largeImageURL'])
        return pics


@socketio.on('text')
def handle_message(message):
    # handle_message_noun_phrases(message)
    # handle_message_nouns(message)
    process_text(message)


def process_text(text):
    logger.info(text)
    # TODO: process sentence to array of words
    socketio.emit('word_array', ['word1', 'word2'])


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
    txt = message['data']
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
    print(noun_phrases_list)
    end_time = timeit.timeit()
    print(end_time - begin_time)
    sys.stdout.flush()
    socketio.emit('text', noun_phrases_list)


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


if __name__ == '__main__':
    logger.debug("start")
    query_pexels('')
    # socketio.run(app, host='10.51.104.226', debug=True)
    socketio.run(app, debug=False)
