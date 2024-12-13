import os
import login_credentials

class Config:
    # Chiavi e configurazioni sensibili
    #JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', os.urandom(24))
    JWT_SECRET_KEY = os.urandom(24)
    
    SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')  # Nessun valore di default
    SESSION_TYPE = 'filesystem'
    # Configurazioni di Flask-SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configurazioni email
    MAIL_SERVER = login_credentials.mail_server
    MAIL_PORT = login_credentials.mail_port
    MAIL_USERNAME = login_credentials.mail
    MAIL_PASSWORD = login_credentials.password
    MAIL_DEFAULT_SENDER = login_credentials.mail_default_sender_2
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
