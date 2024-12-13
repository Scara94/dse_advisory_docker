import os
import login_credentials
from flask import Blueprint, request, jsonify, abort, send_file
from flask_jwt_extended import jwt_required
import psycopg2
from config import Config
import datetime

fileManager = Blueprint('fileManager', __name__)

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

def get_timestamped_filename(filename):
    base, extension = os.path.splitext(filename)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{base}_{timestamp}{extension}"

    return os.path.join(login_credentials.upload_folder, unique_filename)

def save_file(file):
    if file:
        #filepath = secure_filename(get_timestamped_filename(file.filename))
        filepath = get_timestamped_filename(file.filename)
        file.save(filepath)
        return filepath
    else:
        return None

def delete_file(path):
    if os.path.exists(path):
        os.remove(path)
        return True
    return False

@fileManager.route('/download/<int:doc_id>')
def download(doc_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        #Get the path of the file to download
        cur.execute("select link from dse_advisory.document where id = %s", (doc_id,))
        filepath = cur.fetchone()[0]
        conn.commit()

        if not filepath or not os.path.exists(filepath):
            abort(404)  # If the file does not exist, return a 404 error.
        return send_file(filepath, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@fileManager.route('/delete_doc/<int:doc_id>', methods=['PATCH'])
@jwt_required()
def delete_news_doc(doc_id):
    print(doc_id)
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("delete from dse_advisory.document where id = %s returning link", (doc_id,))
        path = cur.fetchone()[0]
        conn.commit()
        print(path)
        deleted = delete_file(path)
        if deleted:
            return jsonify({"success": True})
    except Exception as e:
        print(str(e))
        return({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@fileManager.route('/upload_docs/<int:news_id>', methods=['POST'])
@jwt_required()
def upload_docs(news_id):
    print('news ID:', news_id)
    files = request.files.getlist('files')
    print('numero file ricevuti:', len(files))
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        for file in files:
            print(file)
            filepath = save_file(file)
            if filepath:
                cur.execute("insert into dse_advisory.document (link) values (%s) returning id", (filepath,))
                doc_id = cur.fetchone()[0]
                cur.execute("insert into dse_advisory.news_doc (news_id, document_id) values (%s, %s)", (news_id, doc_id))
                conn.commit()
        return jsonify({"success": True, "doc_id": doc_id})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@fileManager.route('/upload_thesis_docs/<int:thesis_id>', methods=['POST'])
@jwt_required()
def upload_thesis_doc(thesis_id):
    print('thesis ID:', thesis_id)
    files = request.files.getlist('file')
    print('numero file ricevuti:', len(files))
    description = request.form.get('description')
    print('descrizione: ', description)
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        for file in files:
            print(file)
            filepath = save_file(file)
            if filepath:
                cur.execute("insert into dse_advisory.document (link, description) values (%s, %s) returning id", (filepath, description))
                doc_id = cur.fetchone()[0]
                cur.execute("insert into dse_advisory.thesis_doc (thesis_id, document_id) values(%s, %s)", (thesis_id, doc_id))
                conn.commit()

        return jsonify({"success": True, "doc_id": doc_id})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()
