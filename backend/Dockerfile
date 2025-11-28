FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# ENV FLASK_RUN_HOST=0.0.0.0 - no flask in this project

CMD ["uvicorn", "fastapi_server_w_db:app", "--host", "0.0.0.0", "--port", "5000"]


