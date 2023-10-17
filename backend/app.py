import sqlite3
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import requests

conn = sqlite3.connect('chat_rooms.db', check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_rooms (
        id TEXT PRIMARY KEY,
        user1_id TEXT,
        user2_id TEXT,
        language1 TEXT,
        language2 TEXT
    )
''')

conn.commit()
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"])

languages = []
libretranslate_languages_url = "https://libretranslate.com/languages"


def get_languages():
    try:
        response = requests.get(libretranslate_languages_url)
        if response.status_code == 200:
            response = response.json()
            for language in response:
                languages.append(language)
        else:
            print(f"Failed to retrieve languages. Status code: {response.status_code}")

    except Exception as e:
        print(f"An error occurred: {str(e)}")


@app.route('/api/createChatRoom', methods=['POST'])
def create_chat_room():
    chat_room_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO chat_rooms (id) VALUES (?)", (chat_room_id,))
    conn.commit()

    return jsonify({'chatRoomId': chat_room_id}), 201


@app.route('/api/setUser', methods=['POST'])
def set_user():
    data = request.get_json()
    chat_room_id = data['route'].split("/chat/")[1]
    cursor.execute("SELECT user1_id, user2_id, language1, language2 FROM chat_rooms WHERE id = ?", (chat_room_id,))
    result = cursor.fetchone()

    if result is not None:
        user1_id, user2_id, language1, language2 = result

        if user1_id is None:
            user1_id = str(uuid.uuid4())
            updated_user_id = user1_id
            language1 = "en"
        elif user2_id is None:
            user2_id = str(uuid.uuid4())
            updated_user_id = user2_id
            language2 = "en"
        else:
            return jsonify({'message': 'Both user1 and user2 are already set for the chat room'}), 429

        cursor.execute("UPDATE chat_rooms SET user1_id = ?, user2_id = ?, language1 = ?, language2 = ? WHERE id = ?",
                       (user1_id, user2_id, language1, language2, chat_room_id))
        conn.commit()

        return jsonify({'chatRoomId': chat_room_id, 'updatedUserId': updated_user_id}), 201
    else:
        return jsonify({'message': 'Chat room not found'}), 404


@app.route('/api/languages', methods=['GET'])
def create_chat_room():
    return jsonify(languages), 201


@socketio.on('message')
def handle_message(data):
    message = data['message']
    user_id = data['id']
    chat_room = data['chat']
    emit('message', message, broadcast=True)
