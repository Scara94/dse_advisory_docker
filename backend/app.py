from flask import Flask
from config import Config
from datetime import timedelta
from auth.local_auth import local_auth
from flask_jwt_extended import JWTManager
from editProfileManager.editProfile import edit_profile
from auth.cas_auth import cas_auth
from news.manageNews import manage_news
from filesManager.fileManager import fileManager
from thesis.teacherThesis import teacher_thesis
from thesis.studentThesis import student_thesis
from flask_session import Session
from flask_mail import Mail
import login_credentials
from flask_cors import CORS
import logging

sess = Session()
app = Flask(__name__)
CORS(app, allow_headers=["Content-Type", "Authorization"], methods=['GET', 'POST', 'ORIGINS', 'FETCH', 'PATCH'])
app.config.from_object(Config)
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['UPLOAD_FOLDER'] = login_credentials.upload_folder
app.config['MAX_CONTENT_LENGTH'] = login_credentials.max_content_length


jwt = JWTManager(app)
mail = Mail(app)
sess.init_app(app)

#Blueprint registration
app.register_blueprint(local_auth, url_prefix='/api')
app.register_blueprint(edit_profile, url_prefix='/api')
app.register_blueprint(cas_auth, url_prefix='/api')
app.register_blueprint(manage_news, url_prefix='/api')
app.register_blueprint(fileManager, url_prefix='/api')
app.register_blueprint(teacher_thesis, url_prefix='/api')
app.register_blueprint(student_thesis, url_prefix='/api')

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    app.run(host='0.0.0.0', port=5001, debug=True)
    #app.run(debug=True)