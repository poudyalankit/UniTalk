import sqlite3
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS

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
CORS(app)


@app.route('/api/createChatRoom', methods=['POST'])
def create_chat_room():
    chat_room_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO chat_rooms (id) VALUES (?)", (chat_room_id,))
    conn.commit()

    return jsonify({'chatRoomId': chat_room_id}), 201


@app.route('/api/setUser', methods=['POST'])
def set_user():
    data = request.get_json()
    chat_room_id = data.get('route').split("/chat/")[1]
    cursor.execute("SELECT user1_id, user2_id FROM chat_rooms WHERE id = ?", (chat_room_id,))
    result = cursor.fetchone()

    if result is not None:
        user1_id, user2_id = result

        if user1_id is None:
            user1_id = str(uuid.uuid4())
            updated_user_id = user1_id
        elif user2_id is None:
            user2_id = str(uuid.uuid4())
            updated_user_id = user2_id
        else:
            return jsonify({'message': 'Both user1 and user2 are already set for the chat room'}), 429

        cursor.execute("UPDATE chat_rooms SET user1_id = ?, user2_id = ? WHERE id = ?",
                       (user1_id, user2_id, chat_room_id))
        conn.commit()

        return jsonify({'chatRoomId': chat_room_id, 'updatedUserId': updated_user_id}), 201
    else:
        return jsonify({'message': 'Chat room not found'}), 404


if __name__ == '__main__':
    app.run(host='localhost', debug=True, port=3001)
