from flask import Flask, jsonify, request, Response
from flask_cors import CORS  
import uuid, sqlite3

conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()


cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )
''')
conn.commit()

app = Flask(__name__)
CORS(app)


@app.route('/user/register', methods=['POST'])
def create_user():
    unique_id = str(uuid.uuid4())
    username = request.json['username']
    password = request.json['password']
    
    #Check if username already exists
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', (username,))
    result = cursor.fetchone()
    if result[0] > 0:
        fail_message = {
            "success": False,
            "message": "Failed to create user. Username already exists."
        }
        response = jsonify(fail_message)
        return response, 401

    cursor.execute('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', (unique_id, username, password))
    conn.commit()
    success_message = {
        "success": True,
        "message": "Created user."
    }
    response = jsonify(success_message)
    return response, 201

if __name__ == '__main__':
    app.run(host='localhost', debug=True, port=3001)