FROM python:3.12.8

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY /backend .

ENV FLASK_APP=app.py
ENV FLASK_ENV=development

RUN pip install gunicorn

EXPOSE 5001

#CMD [ "flask", "run", "--host=0.0.0.0", "--port=5001" ]

#CMD [ "python", "-u", "app.py" ]
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
