from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from logger import getlogger
import nltk
from flickrapi import FlickrAPI
import json

logger = getlogger(__name__)

app = Flask(__name__, template_folder='html/templates', static_folder='html/static')
socketio = SocketIO(app)
app.debug = False

flickr = FlickrAPI('c6a2c45591d4973ff525042472446ca2', '202ffe6f387ce29b', format='parsed-json')


@app.route('/')
def index():
    return render_template('test1.html')


def query_flickr(nouns):
    if nouns:
        extras = 'url_n'
        query = " ".join(nouns)
        print("query= " + query)

        max = 9
        results = flickr.photos.search(text=query, per_page=max, extras=extras)
        pics = []

        for i in range(0, max):
            try:
                pics.append(results['photos']['photo'][i]['url_n'])
                print(pics)
            except Exception as ex:
                pass

        return pics


@socketio.on('text')
def handle_message(message):
    txt = message['data']
    print(txt)
    is_noun = lambda pos: pos[:2] == 'NN'
    tokenized = nltk.word_tokenize(txt)
    nouns = [word for (word, pos) in nltk.pos_tag(tokenized) if is_noun(pos)]
    print(nouns)
    socketio.emit('text', nouns)

    pics = query_flickr(nouns)

    if pics:
        socketio.emit('pics', pics)


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


if __name__ == '__main__':
    logger.debug("start")
    # socketio.run(app, host='10.51.104.226', debug=True)
    socketio.run(app, debug=True)
