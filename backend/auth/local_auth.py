from flask import Blueprint, request, jsonify, session
import psycopg2
from config import Config
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request

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
            access_token = create_access_token(identity=user_data['username'])
            print(access_token)
            print(user_data)
            session['user_type'] = user_data['user_type']
            session['firstname'] = user_data['firstname']
            session['lastname'] = user_data['lastname']
            return jsonify({"message": "Login successful", "user": user_data, "access_token": access_token}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

@local_auth.route('/check_session', methods=['GET'])
@jwt_required()
def check_session():
    import app
    """
    #o si usano le session
        #user = session.get('user')

        #o i jwt
        #verify_jwt_in_request()
        user = get_jwt_identity()

        if user:
            print(f"Response JSON: {request.get_json()}")
            return jsonify(user), 200
        else:
            print(f"Response JSON: {request.get_json()}")
            return jsonify({'message': 'No active session'}), 401
    """
    try:
        # Verifica che il JWT sia presente e valido
        #verify_jwt_in_request()  # Questo verifica la validità del token nella richiesta
        
        # Ottieni l'identità dell'utente (dal JWT)
        current_user = get_jwt_identity()

        if current_user:
            """
            user_type = request.args.get('userType')  # Recupera 'userType' dalla query string
            firstname = request.args.get('firstname')  # Recupera 'firstname'
            lastname = request.args.get('lastname')  # Recupera 'lastname'
            """
            user_type = session.get('user_type')
            firstname = session.get('firstname')
            lastname = session.get('lastname')
            
            print("Dati ricevuti dal frontend:", user_type, firstname, lastname, current_user)
            return jsonify({"username": current_user, "user_type": user_type, "firstname": firstname, "lastname": lastname}), 200
    except Exception as e:
        # Gestisci eventuali errori, come JWT mancante o non valido
        print(str(e))
        return jsonify({"msg": "Token is invalid or missing", "error": str(e)}), 401
    

@local_auth.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200