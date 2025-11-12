# Hospital Assistant API

A simple **FastAPI** application for managing patient sessions with AI-assisted conversations.

---

## Quick Start
### Prerequisite
Install uv
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync
```
### 1. Setup Database
```bash
chmod +x init_db.sh
./init_db.sh
```
### 2. Install Dependencies
```bash
pip install -r requirements.txt
```
### 3. Run the Application
```bash
uvicorn main:app --reload
```
### 4. View API Documentation
Open your browser and go to:
http://localhost:8000/docs
