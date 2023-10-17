import json
import sqlite3
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from libretranslatepy import LibreTranslateAPI


conn = sqlite3.connect('chat_rooms.db', check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    user1_id TEXT,
    user2_id TEXT,
    language1 TEXT,
    language2 TEXT,
    user1_messages TEXT,
    user2_messages TEXT
    )
''')

conn.commit()
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"])

lt = LibreTranslateAPI("https://translate.argosopentech.com/")
languages = lt.languages()


@app.route('/api/createChatRoom', methods=['POST'])
def create_chat_room():
    chat_room_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO chat_rooms (id) VALUES (?)", (chat_room_id,))
    conn.commit()

    return jsonify({'chatRoomId': chat_room_id}), 201


@app.route('/api/setUser', methods=['POST'])
def set_user():
    data = request.get_json()
    chat_room_id = data['route']
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
def get_languages_from_memory():
    return jsonify(languages), 201


@app.route('/api/setLanguage', methods=['POST'])
def set_language():
    try:
        data = request.get_json()
        user_id = data['userID']
        chat_room_id = data['chatRoomID']
        new_language = data['language']

        cursor.execute("SELECT user1_id, user2_id FROM chat_rooms WHERE id = ?", (chat_room_id,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'message': 'Chat room not found'}), 404

        user1_id, user2_id = result

        if user_id == user1_id:
            cursor.execute("UPDATE chat_rooms SET language1 = ? WHERE id = ?", (new_language, chat_room_id))
        elif user_id == user2_id:
            cursor.execute("UPDATE chat_rooms SET language2 = ? WHERE id = ?", (new_language, chat_room_id))
        else:
            return jsonify({'message': 'User not found in the specified chat room'}), 404

        conn.commit()

        return jsonify({'message': 'Language updated successfully'}), 200

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({'message': f"An error occurred: {str(e)}"}), 500


@socketio.on('message')
def handle_message(data):
    message = data['message']
    user_id = data['id']
    chat_room = data['chat']

    cursor.execute("SELECT user1_id, user2_id, language1, language2 FROM chat_rooms WHERE id = ?", (chat_room,))
    result = cursor.fetchone()

    user1_id, user2_id, language1, language2 = result
    sender_language = language1 if user_id == user1_id else language2
    recipient_language = language2 if user_id == user1_id else language1

    other_user_id = user2_id if user_id == user1_id else user1_id

    sender_column = 'user1_messages' if user_id == user1_id else 'user2_messages'
    cursor.execute(
        f"UPDATE chat_rooms SET {sender_column} = json_insert(coalesce({sender_column}, '[]'), '$[#]', ?) WHERE id = ?",
        (json.dumps(message), chat_room))

    translated_message = message
    if sender_language != recipient_language:
        translated_message = lt.translate(message, sender_language, recipient_language)

    recipient_column = 'user2_messages' if user_id == user1_id else 'user1_messages'
    cursor.execute(
        f"UPDATE chat_rooms SET {recipient_column} = json_insert(coalesce({recipient_column}, '[]'), '$[#]', ?) WHERE id = ?",
        (json.dumps(translated_message), chat_room))

    conn.commit()

    if other_user_id is not None:
        full_message = {
            "chat_room": chat_room,
            "from": user_id,
            "to": other_user_id,
            "message": translated_message
        }
        emit(other_user_id, full_message, broadcast=True)
