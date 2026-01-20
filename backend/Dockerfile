FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu

RUN apt-get update && \
apt-get install -y --no-install-recommends \
build-essential \
libffi-dev \
libssl-dev \
python3-dev \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .

ENV FLASK_RUN_HOST=0.0.0.0
ENV PYTHONPATH=/app

CMD ["python", "app/main.py"]
