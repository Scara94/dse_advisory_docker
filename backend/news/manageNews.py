from flask import Blueprint, request, jsonify, session
from flask_jwt_extended import jwt_required
import psycopg2
from config import Config
import filesManager.fileManager as fm
from datetime import datetime
import login_credentials
import os 

manage_news = Blueprint('manage_news', __name__)

def get_db_connection():
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URL)
    return conn

@manage_news.route('/add_news', methods=['POST'])
@jwt_required()
def add_news():
    data = request.form
    cohort = data.get('cohort')
    #ottengo una list di cohort
    cohort_list = cohort.split(',')
    subject = data.get('subject')
    content = data.get('content')
    #if data.get('expirationDate')
    exp_date = data.get('expirationDate') if data.get('expirationDate') != 'null' else None
    
    
    #print("cohort list type:", type(cohort_list), cohort_list)
    
    #print(data)
    print(subject)
    print(content)
    print(cohort_list)
    print(exp_date)
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        formatted_date = None
        if exp_date:
            # Separiamo solo la parte che ci interessa (la data, senza ora e fuso orario)
            date_part = exp_date.split('00:00:00')[0].strip()

            # Parsing della stringa (solo la parte della data)
            parsed_date = datetime.strptime(date_part, '%a %b %d %Y')

            # Formattazione della data nel formato MM/DD/YYYY
            formatted_date = parsed_date.strftime('%Y-%m-%d')

        #aggiungo la news nella tabella news e ne ottengo l'id
        cur.execute("insert into dse_advisory.news (subject, content, expiration_date) values (%s, %s, %s) returning id", (subject, content, formatted_date))
        news_id = cur.fetchone()[0]
        conn.commit()

        for cohort in cohort_list:
            #ottengo il cohort_id
            cur.execute("select id from dse_advisory.cohort where name = %s", (cohort,))
            result = cur.fetchone()
            cohort_id = result[0]        

            #aggiorno la tabella news_target
            cur.execute("insert into dse_advisory.news_target (cohort_id, news_id) values (%s, %s)", (cohort_id, news_id))
            conn.commit()
        return jsonify({"success": True})
    
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@manage_news.route('/get_news', methods=["POST"])
@jwt_required()
def get_news():
    data = request.json
    username = data.get('username')
    #print(username)
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        #ottengo tutte le news per la coorte di username
        #print("prima della query")
        cur.execute("select id, subject, content, publication_date, is_deleted, COALESCE(array_agg(DISTINCT nd.document_id ORDER BY nd.document_id), ARRAY[]::int[]) AS document_ids from dse_advisory.student left join dse_advisory.news_target on student.cohort_id = news_target.cohort_id left join dse_advisory.news on id = news_id left join dse_advisory.news_doc as nd on nd.news_id = id where username = %s and (expiration_date > CURRENT_DATE or expiration_date is NULL) group by id", (username,))
        #print("dopo la query")
        news = cur.fetchall()
        conn.commit()

        news_list = [
            {
                "subject": row[1],
                "content": row[2],
                "publication_date": row[3].strftime('%Y-%m-%d %H:%M:%S'),
                "is_deleted": row[4],
                "document_ids": row[5] if row[5] else None
            }
            for row in news
        ]
        #print(news_list['document_ids'])
        return jsonify({"success": True, "news_list": news_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    
@manage_news.route('/get_all_news', methods=["GET"])
@jwt_required()
def get_all_news():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Ottengo tutte le news presenti nel db
        cur.execute("""
            SELECT 
                n.id, 
                subject, 
                content, 
                publication_date, 
                expiration_date, 
                n.is_deleted,
                COALESCE(array_agg(DISTINCT c.name), ARRAY[]::text[]) AS target_cohorts, 
                COALESCE(array_agg(DISTINCT nd.document_id), ARRAY[]::int[]) AS document_ids,
                COALESCE(array_agg(DISTINCT d.link), ARRAY[]::text[]) AS document_links,
                COALESCE(array_agg(DISTINCT jsonb_build_object('id', d.id, 'name', split_part(d.link, '/', -1))), ARRAY[]::jsonb[]) AS documents
            FROM 
                dse_advisory.news AS n 
            LEFT JOIN 
                dse_advisory.news_target AS nt ON nt.news_id = n.id 
            LEFT JOIN 
                dse_advisory.cohort AS c ON nt.cohort_id = c.id 
            LEFT JOIN 
                dse_advisory.news_doc AS nd ON n.id = nd.news_id 
            LEFT JOIN 
                dse_advisory.document AS d ON nd.document_id = d.id 
            GROUP BY 
                n.id;
        """)
        news = cur.fetchall()
        conn.commit()
        #print(news)

        news_list = [
            {
                "id": row[0],
                "subject": row[1],
                "content": row[2],
                "publication_date": row[3].strftime('%Y-%m-%d %H:%M:%S'),
                "expiration_date": row[4],
                "is_deleted": row[5],
                "target_cohorts": row[6],
                "document_ids": row[7] if row[7] else None,
                "document_names": [
                    {"id": doc['id'], "name": doc['name']} 
                    for doc in (row[9] if row[9] else [])
                ]
            }
            for row in news
        ]
        print('NEWS_LIST:', news_list)

        return jsonify({"success": True, "news_list": news_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@manage_news.route('/delete_news/<int:news_id>', methods=['PATCH'])
@jwt_required()
def delete_news(news_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("update dse_advisory.news set is_deleted = true where id = %s", (news_id,))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@manage_news.route('/activate_news/<int:news_id>', methods=['PATCH'])
@jwt_required()
def activate_news(news_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("update dse_advisory.news set is_deleted = false where id = %s", (news_id,))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

@manage_news.route('/update_news/<int:news_id>', methods=['PATCH'])
@jwt_required()
def update_news(news_id):
    try:
        data = request.form
        subject = data.get('subject')
        content = data.get('content')
        expiration_date = data.get('expirationDate') if data.get('expirationDate') != 'null' else None
        cohorts = data.get('target_cohorts')
        cohorts_list = cohorts.split(',')

        print("news_id", news_id)
        print("expiration date: ", expiration_date)
        #print("expiration_date type:", type(expiration_date), expiration_date)
        print("subject:", subject)
        print("content", content)
        print("cohorts list: ", cohorts_list)

        conn = get_db_connection()
        cur = conn.cursor()
        formatted_date = None
        if expiration_date:
            date_part = expiration_date.split('00:00:00')[0].strip()

            # Parsing della stringa (solo la parte della data)
            parsed_date = datetime.strptime(date_part, '%a %b %d %Y')

            # Formattazione della data nel formato MM/DD/YYYY
            formatted_date = parsed_date.strftime('%Y-%m-%d')
            print("data formattata:", formatted_date)

        #aggiorno la news in dse_advisory.news
        cur.execute("update dse_advisory.news set subject = %s, content = %s, expiration_date = %s where id = %s", (subject, content, formatted_date, news_id))
        #cur.execute("insert into dse_advisory.news (subject, content, expiration_date) values (%s, %s, %s) returning id", (subject, content, exp_date if exp_date else None))
        conn.commit()

        #modifico le target cohort
        #prima cancello i target che sono attivi ora
        cur.execute("delete from dse_advisory.news_target where news_id = %s", (news_id,))
        #conn.commit()

        for cohort in cohorts_list:
            #ottengo il cohort_id
            cur.execute("select id from dse_advisory.cohort where name = %s", (cohort,))
            result = cur.fetchone()
            cohort_id = result[0]        

            #aggiorno la tabella news_target
            cur.execute("insert into dse_advisory.news_target (cohort_id, news_id) values (%s, %s)", (cohort_id, news_id))
            #conn.commit()
        #conn.commit()        
        conn.commit()

        return jsonify({"success": True})
    except Exception as e:
        print("errore: ", str(e))
        return jsonify({"error": str(e)})
    finally:
        cur.close()
        conn.close()

        


    