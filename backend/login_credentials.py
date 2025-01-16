import os

# CAS data
CAS_SERVER_URL = os.getenv('CAS_SERVER_URL')
SERVICE_URL = os.getenv('SERVICE_URL')

# SMTP login credentials
mail = os.getenv('MAIL_USERNAME')
password = os.getenv('MAIL_PASSWORD')
#mail_default_sender_1 = os.getenv('MAIL_DEFAULT_SENDER_1')
mail_default_sender_2 = (
    os.getenv('MAIL_DEFAULT_SENDER_NAME'),
    os.getenv('MAIL_DEFAULT_SENDER_EMAIL')
)
mail_server = os.getenv('MAIL_SERVER')
mail_port = int(os.getenv('MAIL_PORT'))

# Upload folder and file settings
upload_folder = os.getenv('UPLOAD_FOLDER')
max_content_length = int(os.getenv('MAX_CONTENT_LENGTH'))
allowed_extensions = set(os.getenv('ALLOWED_EXTENSIONS', 'pdf').split(','))
