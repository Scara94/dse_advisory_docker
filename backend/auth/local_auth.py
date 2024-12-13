from flask import Blueprint, request, jsonify, session
import psycopg2
from config import Config
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

local_auth = Blueprint('local_auth', __name__)

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

def check_password(username, password):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("select password, salt from dse_advisory.user_login_credentials where username = %s", (username,))
    stored_hash, salt = cur.fetchone()
    cur.close()
    conn.close()
    password = bcrypt.hashpw(password.encode('utf-8'), salt.encode('utf-8'))

    if password.decode('utf-8') == stored_hash:
        return True
    else:
        return False

@local_auth.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if check_password(username, password):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('select username, user_type, firstname, lastname, is_active from dse_advisory.user_login_credentials where username = %s and is_active = true', (username,))
        user = cursor.fetchone()
        if user and user[4] == True:
            user_data = {
                'username': user[0],
                'user_type': user[1],
                'firstname': user[2],
                'lastname': user[3]
            }
            access_token = create_access_token(identity=user_data)
            print(access_token)
            print(user_data)
            return jsonify({"message": "Login successful", "user": user_data, "access_token": access_token}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

@local_auth.route('/check_session', methods=['GET'])
@jwt_required()
def check_session():

    #o si usano le session
    #user = session.get('user')

    #o i jwt
    user = get_jwt_identity()

    if user:
        return jsonify(user), 200
    else:
        return jsonify({'message': 'No active session'}), 401
    
@local_auth.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200