from flask import Blueprint, request, jsonify, session
from flask_jwt_extended import jwt_required
import psycopg2
from config import Config
import filesManager.fileManager as fm
from datetime import datetime

teacher_thesis = Blueprint('teacher_thesis', __name__)

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

@teacher_thesis.route('/add_teacher_proposal', methods=['POST'])
@jwt_required()
def add_teacher_proposal():
    data = request.form
    title = data.get('title')
    description = data.get('description')
    keys = data.get('keys')
    expiration = data.get('expiration') if data.get('expiration') != 'null' else None
    duration = data.get('duration')
    teacher = data.get('teacher')
    userType = data.get('userType')
    print('titolo:', title)
    print('description:', description)
    print('keys:', keys)
    print('duration', duration)
    print('teacher:', teacher)
    print('user type:', userType)

    formatted_date = None
    if expiration:
        # Let's separate only the part that interests us (the date, without the time and timezone)
        date_part = expiration.split('00:00:00')[0].strip()

        # Parse the string (only the date part)
        parsed_date = datetime.strptime(date_part, '%a %b %d %Y')

        # Format the date in the MM/DD/YYYY format
        formatted_date = parsed_date.strftime('%Y-%m-%d')
    print('expiration', formatted_date)
    try:
        conn = get_db_connection()
        cur = conn.cursor()
    
        cur.execute("insert into dse_advisory.thesis_proposal (title, description, keys, duration, expiration, teacher) values (%s, %s, %s, %s, %s, %s)", (title, description, keys, duration, formatted_date, teacher))
        conn.commit()

        return jsonify({'success': True})
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)})
    finally:
        cur.close()
        conn.close()

@teacher_thesis.route('/fetch_pending_thesis', methods=['POST'])
@jwt_required()
def fetch_pending_thesis():
    data = request.json
    teacher = data.get('teacher')

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("select id, title, student_username, firstname, lastname, serial_id from dse_advisory.thesis join dse_advisory.student on student_username = username where assignmentdate is NULL and is_deleted = 'false' and supervisor = %s ", (teacher, ))
        thesis = cur.fetchall()
        conn.commit()

        pending_thesis_list = [
            {
                "id": row[0],
                "title": row[1],
                "student_username": row[2],
                "firstname": row[3],
                "lastname": row[4],
                "serial_id": row[5]
            } 
            for row in thesis
        ]
        return jsonify({"success": True, "pending_thesis": pending_thesis_list})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@teacher_thesis.route('/decline_thesis/<int:thesis_id>', methods=['PATCH'])
@jwt_required()
def decline_thesis(thesis_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("update dse_advisory.thesis set is_deleted = 'true' where id = %s", (thesis_id,))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@teacher_thesis.route('/accept_thesis/<int:thesis_id>', methods=['PATCH'])
@jwt_required()
def accept_thesis(thesis_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("update dse_advisory.thesis set assignmentdate = CURRENT_DATE where id = %s", (thesis_id,))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@teacher_thesis.route('/fetch_teacher_thesis_proposal', methods = ['POST'])
@jwt_required()
def fetch_teacher_thesis_proposal():
    data = request.json
    teacher = data.get('teacher')
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("select id, title, description, keys, duration, expiration from dse_advisory.thesis_proposal where teacher = %s and is_deleted = false", (teacher, ))
        thesis = cur.fetchall()
        conn.commit()

        thesis_proposal_list = [
            {
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "keys": row[3],
                "duration": row[4],
                "expiration": row[5]
            }
            for row in thesis
        ]
        return jsonify({"success": True, "thesis_proposal_list": thesis_proposal_list})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})

@teacher_thesis.route('/update_thesis_proposal/<int:proposal_id>', methods=['PATCH'])
@jwt_required()
def update_thesis_proposal(proposal_id):
    data = request.form
    title = data.get('title')
    description = data.get('description')
    keys = data.get('keys')
    expiration = data.get('expiration') if data.get('expiration') != 'null' else None
    duration = data.get('duration')

    formatted_date = None
    if expiration:
        date_part = expiration.split('00:00:00')[0].strip()
        parsed_date = datetime.strptime(date_part, '%a %b %d %Y')
        formatted_date = parsed_date.strftime('%Y-%m-%d')

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("update dse_advisory.thesis_proposal set title = %s, description = %s, keys = %s, expiration = %s, duration = %s where id = %s", (title, description, keys, formatted_date, duration, proposal_id))
        conn.commit()

        return jsonify({"success": True})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@teacher_thesis.route('/delete_thesis_proposal/<int:proposal_id>', methods=['PATCH'])
@jwt_required()
def delete_thesis_proposal(proposal_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("update dse_advisory.thesis_proposal set is_deleted = true where id = %s", (proposal_id,))
        conn.commit()

        return jsonify({"success": True})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})

@teacher_thesis.route('/fetch_teacher_activated_thesis/<string:teacher>', methods=['GET'])
@jwt_required()
def fetch_teacher_activated_thesis(teacher):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""SELECT 
                            t.id,
                            t.title, 
                            student_username, 
                            firstname, 
                            lastname, 
                            serial_id,
                            assignmentdate,
                            discussiondate,
                            COALESCE(array_agg(DISTINCT td.document_id), ARRAY[]::int[]) AS document_ids,
                            COALESCE(array_agg(DISTINCT d.link), ARRAY[]::text[]) AS document_links,
                            COALESCE(array_agg(DISTINCT jsonb_build_object(
                                'id', d.id, 
                                'name', split_part(d.link, '/', -1),
                                'description', d.description
                            )), ARRAY[]::jsonb[]) AS documents
                        FROM 
                            dse_advisory.thesis AS t
                        JOIN 
                            dse_advisory.student ON student_username = username
                        LEFT JOIN
                            dse_advisory.thesis_doc AS td ON t.id = td.thesis_id
                        LEFT JOIN
                            dse_advisory.document AS d ON td.document_id = d.id
                        WHERE
                            assignmentdate IS NOT NULL 
                            AND t.is_deleted = 'false' 
                            AND supervisor = %s
                        GROUP BY
                            t.id,
                            serial_id,
                            firstname,
                            lastname;
                    """, (teacher, ))
                        
        thesis = cur.fetchall()
        conn.commit()

        column_names = [desc[0] for desc in cur.description]
        activated_thesis_list = []
        for row in thesis:
            thesis_dict = dict(zip(column_names, row))
            activated_thesis_list.append(thesis_dict)
        return jsonify({"success": True, "activated_thesis_list": activated_thesis_list})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    