from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from logger import getlogger
import nltk
import sys
import timeit
from nltk.corpus import conll2000

logger = getlogger(__name__)

app = Flask(__name__, template_folder='html/templates', static_folder='html/static')
socketio = SocketIO(app)
app.debug = False


@app.route('/')
def index():
    return render_template('test1.html')


@socketio.on('text')
def handle_message(message):
    handle_message_noun_phrases(message)

def handle_message_nouns(message):
    txt = message['data']
    print(txt)
    begin_time = timeit.timeit()
    is_noun = lambda pos: pos[:2] == 'NN'
    tokenized = nltk.word_tokenize(txt)
    nouns = [word for (word, pos) in nltk.pos_tag(tokenized) if is_noun(pos)]
    end_time = timeit.timeit()
    print(end_time-begin_time)
    sys.stdout.flush()
    socketio.emit('text', nouns)

def handle_message_noun_phrases(message):
    txt = message['data']
    print(txt)
    begin_time = timeit.timeit()
    
    tokenized = nltk.word_tokenize(txt)
    tagged = nltk.pos_tag(tokenized)
    grammar = "NP: {<DT>?<JJ\w?>*<NN\w?>}"
    #grammar = "NP: {(<V\w+>|<NN\w?>)+.*<NN\w?>}"
    
    cp  = nltk.RegexpParser(grammar)
    parsed = cp.parse(tagged)
    print(parsed)
    noun_phrases_list = [' '.join(leaf[0] for leaf in tree.leaves()) 
                      for tree in parsed.subtrees() 
                      if tree.label()=='NP'] 
    print(noun_phrases_list)

    end_time = timeit.timeit()
    print(end_time-begin_time)
    sys.stdout.flush()
    socketio.emit('text', noun_phrases_list)

@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


if __name__ == '__main__':
    logger.debug("start")
    # socketio.run(app, host='10.51.104.226', debug=True)
    socketio.run(app, debug=False)
