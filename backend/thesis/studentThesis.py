from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import psycopg2
from config import Config
import filesManager.fileManager as fm
from datetime import datetime

student_thesis = Blueprint('student_thesis', __name__)

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

@student_thesis.route('/fetch_all_thesis_proposal', methods=['GET'])
#@jwt_required()
def fetch_all_thesis_proposal():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""SELECT 
                            tp.id, 
                            tp.title, 
                            tp.description, 
                            tp.keys, 
                            tp.duration, 
                            tp.expiration,
                            tp.teacher AS teacher_username,
                            ulc.firstname AS teacher_firstname,
                            ulc.lastname AS teacher_lastname
                        FROM 
                            dse_advisory.thesis_proposal tp
                        LEFT JOIN 
                            dse_advisory.user_login_credentials ulc 
                        ON 
                            tp.teacher = ulc.username
                        WHERE 
                            tp.is_deleted = false
                    """)
        thesis_proposal = cur.fetchall()
        conn.commit()
        thesis_proposal_list = [
            {
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "keys": row[3],
                "duration": row[4],
                "expiration": row[5],
                "teacher_username": row[6],
                "teacher_firstname": row[7],
                "teacher_lastname": row[8]
            }
            for row in thesis_proposal
        ]

        return jsonify({'success': True, "thesis_proposal_list": thesis_proposal_list})
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)})
    finally:
        cur.close()
        conn.close()

@student_thesis.route('/fetch_all_teachers', methods=['GET'])
#@jwt_required()
def fetch_all_teachers():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""select username, firstname, lastname
                        from dse_advisory.teacher
                        where is_active = true;
                    """,)
        teachers = cur.fetchall()
        conn.commit()
        teachers_list = [
            {
                "username": row[0],
                "firstname": row[1],
                "lastname": row[2]
            }
            for row in teachers
        ]

        return jsonify({"success": True, "teachers_list": teachers_list})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@student_thesis.route('/make_student_thesis_proposal', methods=['POST'])
@jwt_required()
def make_student_thesis_proposal():
    data = request.form
    title = data.get('title')
    supervisor = data.get('supervisor')
    cosupervisor = data.get('cosupervisor')
    duration = data.get('duration')
    student_username = data.get('student_username')

    print('title:', title)
    print('supervisor:', supervisor)
    print('cosup:', cosupervisor, 'lunghezza:', len(cosupervisor))
    print('duration:', duration)
    print('username studente:', student_username)

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        if cosupervisor is not None:
            cur.execute("insert into dse_advisory.thesis (title, student_username, supervisor, co_supervisor) values (%s, %s, %s, %s)", (title, student_username, supervisor, cosupervisor))
        else:
            cur.execute("insert into dse_advisory.thesis (title, student_username, supervisor) values (%s, %s, %s)", (title, student_username, supervisor))

        conn.commit()
        return jsonify({"success": True})
    
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)})

@student_thesis.route('/fetch_student_thesis/<string:student_username>', methods=['GET'])
#@jwt_required()
def fetch_student_thesis(student_username):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""SELECT 
                            t.id, 
                            t.assignmentdate, 
                            t.discussiondate, 
                            t.title, 
                            t.supervisor AS supervisor_username,
                            ulc1.firstname AS supervisor_firstname,
                            ulc1.lastname AS supervisor_lastname,
                            t.co_supervisor AS cosupervisor_username,
                            ulc2.firstname AS cosupervisor_firstname,
                            ulc2.lastname AS cosupervisor_lastname,
                            COALESCE(array_agg(DISTINCT td.document_id), ARRAY[]::int[]) AS document_ids,
                            COALESCE(array_agg(DISTINCT d.link), ARRAY[]::text[]) AS document_links,
                            COALESCE(array_agg(DISTINCT jsonb_build_object(
                                'id', d.id, 
                                'name', split_part(d.link, '/', -1),
                                'description', d.description
                            )), ARRAY[]::jsonb[]) AS documents
                        FROM 
                            dse_advisory.thesis t
                        LEFT JOIN 
                            dse_advisory.user_login_credentials ulc1 
                            ON t.supervisor = ulc1.username
                        LEFT JOIN 
                            dse_advisory.user_login_credentials ulc2 
                            ON t.co_supervisor = ulc2.username
                        LEFT JOIN
                            dse_advisory.thesis_doc AS td 
                            ON t.id = td.thesis_id
                        LEFT JOIN
                            dse_advisory.document AS d
                            ON d.id = td.document_id
                        WHERE 
                            t.student_username = %s 
                            AND t.assignmentdate IS NOT NULL
                        GROUP BY
                            t.id,
                            ulc1.firstname,
                            ulc1.lastname,
                            ulc2.firstname,
                            ulc2.lastname;

                    """, (student_username,))
        result = cur.fetchone()
        conn.commit()
        print("result:", result)

        column_names = [desc[0] for desc in cur.description]
        student_thesis = dict(zip(column_names, result))

        return jsonify({"success": True, "student_thesis": student_thesis})
    
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()
    
@student_thesis.route('/update_thesis/<int:thesis_id>', methods=['PATCH'])
@jwt_required()
def update_thesis(thesis_id):
    try:
        data = request.form
        title = data.get('title')
        discussiondate = data.get('discussiondate') if data.get('discussiondate') != 'null' else None
        print('titolo:', title)
        print('discussion date:', discussiondate)

        formatted_date = None
        if discussiondate:
            date_part = discussiondate.split('00:00:00')[0].strip()
            parsed_date = datetime.strptime(date_part, '%a %b %d %Y')
            formatted_date = parsed_date.strftime('%Y-%m-%d')
        print('data formattata:', formatted_date)

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("update dse_advisory.thesis set title = %s, discussiondate = %s where id = %s", (title, formatted_date, thesis_id))
        conn.commit()


        return jsonify({'success':True})
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)})
    finally:
        cur.close()
        conn.close()
    
@student_thesis.route('/change_sup_cosup/<int:thesis_id>', methods=['PATCH'])
@jwt_required()
def change_sup_cosup(thesis_id):
    try:
        data = request.form
        new_sup = data.get('newSupervisor') if data.get('newSupervisor') else None
        new_cosup = data.get('newCosupervisor') if data.get('newCosupervisor') else None
        print("supervisor:", new_sup)
        print('cosupervisor:', new_cosup)
        conn = get_db_connection()
        cur = conn.cursor()
        
        if new_cosup is not None and new_sup is not None:
            cur.execute("update dse_advisory.thesis set supervisor = %s, co_supervisor = %s, assignmentdate = NULL where id = %s", (new_sup, new_cosup, thesis_id))
        elif new_cosup is None and new_sup is not None:
            cur.execute("update dse_advisory.thesis set supervisor = %s, assignmentdate = NULL where id = %s", (new_sup, thesis_id))
        elif new_sup is None and new_cosup is not None:
            cur.execute("execute dse_advisory.thesis set co_supervisor = %s where id = %s", (new_cosup, thesis_id))
        conn.commit()
        
        return jsonify({"success": True})
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)})
    finally:
        cur.close()
        conn.close()