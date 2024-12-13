from flask import Blueprint, request, jsonify, session
from flask_jwt_extended import jwt_required
import psycopg2
import bcrypt
from config import Config
import uuid
from flask_mail import Message
import csv
import io
import re

edit_profile = Blueprint('edit_profile', __name__)

#Function to encrypt a password using bcrypt
def encrypt_password(password, salt):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt.encode('utf-8'))
    return hashed_password.decode('utf-8')

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

@edit_profile.route('update_password', methods=['POST'])
@jwt_required()
def update_password():
    data = request.json
    username = data.get('username')
    newPassword = data.get('newPassword')
    userType = data.get('userType')

    #Encrypt the password before storing it
    salt = bcrypt.gensalt().decode('utf-8')
    newPassword = bcrypt.hashpw(newPassword.encode('utf-8'), salt.encode('utf-8')).decode('utf-8')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if userType == 'student':
            cursor.execute("update dse_advisory.student set password = %s, salt = %s where username = %s", (newPassword, salt, username))
        elif userType == 'teacher':
            cursor.execute("update dse_advisory.teacher set password = %s, salt = %s where username = %s", (newPassword, salt, username))
        elif userType == 'coordinator':
            cursor.execute("update dse_advisory.coordinator set password = %s, salt = %s where username = %s", (newPassword, salt, username))
        else:
            return jsonify({'error': 'Invalid user type'}), 400
        
        conn.commit()
        return jsonify({'message': 'password updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

def email_validation(email):
    #use a simple regular expression to validate the email format
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if re.match(email_regex, email):
        return True
    return False

@edit_profile.route('/add_user', methods=['POST'])
@jwt_required()
def add_user():
    from app import mail
    data = request.json
    user_type = data.get('userType')
    username = data.get('username')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        #check if the user is already registered
        cur.execute("select username from dse_advisory.staging where username = %s", (username,))
        existing_user = cur.fetchone()
        if existing_user:
            cur.close()
            conn.close()
            print('User already exists!')
            return jsonify({'success': False, 'message': 'User already exists!'}), 409
        
        #Otherwise, proceed with the insertion
        token = str(uuid.uuid4())
        registration_url = f"http://localhost:3000/register?token={token}&userType={user_type}"
        msg = Message("Complete your registration",
                      recipients=[username])
        msg.body = f"Please complete your registration by clicking the link: {registration_url}"
        cur.execute("insert into dse_advisory.staging (username, token, user_type) values (%s, %s, %s)", (username, token, user_type))
        conn.commit()
        mail.send(msg)
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        print(f"Errore: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@edit_profile.route('/add_multiple_users', methods=['POST'])
@jwt_required()
def add_multiple_users():
    from app import mail
    data = request.form
    user_type = data.get('userType')  # Retrieve the user type
    file = request.files.get('file')  # Retrieve the uploaded file
    print("Tipologia utente:", user_type)
    print("File:", file)

    if not file:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    invalid_emails = []  # List to collect invalid emails
    failed_emails = []  # List to track emails not sent

    try:
        # Read the CSV file directly from memory
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.reader(stream)

        # Skip the header if present.
        next(csv_reader, None)

        conn = get_db_connection()
        cur = conn.cursor()

        # Iterate over the rows of the CSV file
        for row in csv_reader:
            username = row[0]  # Assume that the email is in the first column
            if email_validation(username):
                print(f"Email: {username}")
                # Check if the user is already registered
                cur.execute("SELECT username FROM dse_advisory.staging WHERE username = %s", (username,))
                existing_user = cur.fetchone()
                if existing_user:
                    continue

                # Proceed with the insertion
                token = str(uuid.uuid4())
                registration_url = f"http://localhost:3000/register?token={token}&userType={user_type}"
                msg = Message("Complete your registration", recipients=[username])
                msg.body = f"Please complete your registration by clicking the link: {registration_url}"
                try:
                    cur.execute("INSERT INTO dse_advisory.staging (username, token, user_type) VALUES (%s, %s, %s)", (username, token, user_type))
                    conn.commit()
                    mail.send(msg)  # try to send the email
                except Exception as e:
                    print(f"Errore durante l'invio dell'email a {username}: {str(e)}")
                    failed_emails.append(username)  # Add to the list of emails not sent
            else:
                print(f"Email non valida: {username}")
                invalid_emails.append(username)  # Add the email to the list of invalid emails.

        # Include both invalid emails and unsent emails in the response
        return jsonify({
            'success': True,
            'invalidEmails': invalid_emails,
            'failedEmails': failed_emails
        }), 200
    except Exception as e:
        print(f"Errore: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()



@edit_profile.route('/validate_token', methods=['GET'])
def validate_token():
    token = request.args.get('token')
    print(token)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("select username from dse_advisory.staging where token = %s", (token, ))
        result = cur.fetchone()

        if result:
            username = result[0]
            return jsonify({'success': True, 'username': username})
        else:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 400
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    
@edit_profile.route('/registration', methods=['POST'])
def registration():
    data = request.json
    user_type = data.get('userType')
    username = data.get('username')
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    password = data.get('password')
    if user_type == 'student':
        cohort = data.get('cohort')
        serialID = data.get('serialID')
    elif user_type == 'teacher':
        institution = data.get('institution')
    
    print(data)

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        #password hash
        salt = bcrypt.gensalt().decode('utf-8')
        hashedPassword = bcrypt.hashpw(password.encode('utf-8'), salt.encode('utf-8')).decode('utf-8')
        
        if user_type == 'student':
            cur.execute("select id from dse_advisory.cohort where name = %s", (cohort,))
            result = cur.fetchone()
            cohortID = result[0]
            print(f"cohort_id {cohortID}")
            cur.execute("insert into dse_advisory.student (serial_id, username, password, firstname, lastname, cohort_id, salt) values (%s,%s,%s,%s,%s,%s,%s)", (serialID, username, hashedPassword, firstname, lastname, cohortID, salt))
            cur.execute("delete from dse_advisory.staging where username = %s", (username,))
        elif user_type == 'coordinator':
            #For the coordinator, you need to perform a double insertion, both in the teacher and coordinator tables
            cur.execute("insert into dse_advisory.coordinator (username, password, firstname, lastname, salt) values(%s, %s, %s, %s, %s)", (username, hashedPassword, firstname, lastname, salt))
            cur.execute("insert into dse_advisory.teacher (username, password, firstname, lastname, salt) values(%s, %s, %s, %s, %s)", (username, hashedPassword, firstname, lastname, salt))
            cur.execute("delete from dse_advisory.staging where username = %s", (username,))                
        else:
            cur.execute("insert into dse_advisory.teacher (username, password, firstname, lastname, institution, salt) values (%s, %s, %s, %s, %s, %s)", (username, hashedPassword, firstname, lastname, institution, salt))
            cur.execute("delete from dse_advisory.staging where username = %s", (username,))            
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        print(f"Errore:", {e})
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@edit_profile.route('/cohorts', methods=['GET'])
def fetchCohorts():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("select name from dse_advisory.cohort")
    cohorts = cur.fetchall()
    print(cohorts)
    cur.close()
    conn.close()
    cohort_list = [cohort[0] for cohort in cohorts]
    return jsonify(cohort_list)

@edit_profile.route('/fetchUsers', methods=['GET'])
@jwt_required()
def fetchUsers():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("select username, firstname, lastname, user_type, is_active from dse_advisory.user_login_credentials where firstname is not null")
        rows = cur.fetchall()
        users =[{
            'username': row[0],
            'firstname': row[1],
            'lastname': row[2],
            'user_type': row[3],
            'is_active': row[4]
        } for row in rows]        
        return jsonify({'success': True, 'users': users}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()
    
@edit_profile.route('/toggle_activation', methods=['POST'])
@jwt_required()
def toggle_activation():
    try:
        data = request.json
        print(data)
        username = data.get('username')
        is_active = data.get('isActive')
        user_type = data.get('userType')
        print(username)

        conn = get_db_connection()
        cur = conn.cursor()

        if user_type == 'student':
            cur.execute("update dse_advisory.student set is_active = %s where username = %s", (is_active, username))
        elif user_type == 'teacher':
            cur.execute("update dse_advisory.teacher set is_active = %s where username = %s", (is_active, username))
        elif user_type == 'coordinator':
            cur.execute("update dse_advisory.teacher set is_active = %s where username = %s", (is_active, username))
            cur.execute("update dse_advisory.coordinator set is_active = %s where username = %s", (is_active, username))
        
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()