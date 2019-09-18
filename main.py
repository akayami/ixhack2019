from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from logger import getlogger
import nltk

logger = getlogger(__name__)

app = Flask(__name__, template_folder='html/templates', static_folder='html/static')
socketio = SocketIO(app)
app.debug = False


@app.route('/')
def index():
    return render_template('test1.html')


@socketio.on('text')
def handle_message(message):
    txt = message['data']
    print(txt)
    is_noun = lambda pos: pos[:2] == 'NN'
    tokenized = nltk.word_tokenize(txt)
    nouns = [word for (word, pos) in nltk.pos_tag(tokenized) if is_noun(pos)]
    print(nouns)
    socketio.emit('text', nouns)


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


if __name__ == '__main__':
    logger.debug("start")
    # socketio.run(app, host='10.51.104.226', debug=True)
    socketio.run(app, debug=True)
