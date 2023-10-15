import sqlite3
import uuid

from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

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


if __name__ == '__main__':
    app.run(host='localhost', debug=True, port=3001)
