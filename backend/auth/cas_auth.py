from flask import Flask, redirect, request, jsonify, Blueprint, session
from cas import CASClient
import logging
import os
import ssl
import requests
from requests.adapters import HTTPAdapter
from config import Config
import psycopg2
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import login_credentials

cas_auth = Blueprint('cas_auth', __name__)



class SSLAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = ssl.create_default_context()
        context.set_ciphers('DEFAULT@SECLEVEL=1')  # Lower the security level to allow smaller DH keys.
        kwargs['ssl_context'] = context
        return super(SSLAdapter, self).init_poolmanager(*args, **kwargs)

# configure the logging
logging.basicConfig(level=logging.DEBUG)

# create a custom session
http_session = requests.Session()
http_session.mount('https://', SSLAdapter())

cas_client = CASClient(
    version=3,
    server_url=login_credentials.CAS_SERVER_URL,
    service_url=login_credentials.SERVICE_URL,
    #verify_ssl_certificate=False,
    session=http_session
)

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

@cas_auth.route('/cas_login', methods=["GET"])
def cas_login():
    cas_login_url = cas_client.get_login_url()
    print(cas_login_url)
    return jsonify({'cas_url': cas_login_url})

@cas_auth.route('/cas_login_callback')
def cas_login_callback():
    ticket = request.args.get('ticket')

    if not ticket:
        return "ticket mancante", 400
    
    #verify cas ticket
    username, attribute, pgtiou = cas_client.verify_ticket(ticket)

    if username is None:
        return "Autenticazione fallita", 403
    
    conn = get_db_connection()
    cur = conn.cursor()

    #check if the user exists in the database
    cur.execute("select username, user_type, firstname, lastname, is_active from dse_advisory.user_login_credentials where username = %s", (username,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user and user[4] == True:
        user_data = {
            'username': user[0],
            'user_type': user[1],
            'firstname': user[2],
            'lastname': user[3]
        }
        #session['user'] = user_data
        access_token = create_access_token(identity=user_data['username'])
        return redirect(f'http://localhost:3000/cas_callback?username={username}&success=True')
    else:
        return redirect(f'http://localhost:3000/cas_callback?username={username}&success=False')  

@cas_auth.route('/cas_login_confirmation', methods=['GET'])
def cas_login_confirmation():
    username = request.args.get('username')
    print(username)
    conn = get_db_connection()
    cur = conn.cursor()

    #check if the user exists in the database
    cur.execute("select username, user_type, firstname, lastname, is_active from dse_advisory.user_login_credentials where username = %s", (username,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user and user[4] == True:
        user_data = {
            'username': user[0],
            'user_type': user[1],
            'firstname': user[2],
            'lastname': user[3]
        }
        session['user'] = user_data
        access_token = create_access_token(identity=user_data['username'])
        return jsonify({"user": user_data, "access_token": access_token, "success": True})
    else:
        return jsonify({"success": False})
        


@cas_auth.route("/cas_registration", methods=["POST"])
def cas_registration():
    data = request.json
    user_type = data.get('userType')
    username = data.get('username')
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    if user_type == 'student':
        cohort = data.get('cohort')
        serialID = data.get('serialID')
    else:
        institution = data.get('institution')
    
    print(data)

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if user_type == 'student':
            cur.execute("select id from dse_advisory.cohort where name = %s", (cohort,))
            result = cur.fetchone()
            cohortID = result[0]
            print(f"cohort_id {cohortID}")
            cur.execute("insert into dse_advisory.student (serial_id, username, firstname, lastname, cohort_id) values (%s,%s,%s,%s,%s)", (serialID, username, firstname, lastname, cohortID))
            cur.execute("delete from dse_advisory.staging where username = %s", (username,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"success": True})
        else:
            cur.execute("insert into dse_advisory.teacher (username, password, firstname, lastname, institution, salt) values (%s, %s, %s, %s)", (username, firstname, lastname, institution))
            cur.execute("delete from dse_advisory.staging where username = %s", (username,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"success": True})
    except Exception as e:
        print(f"Errore:", {e})
        return jsonify({'success': False, 'error': str(e)}), 500