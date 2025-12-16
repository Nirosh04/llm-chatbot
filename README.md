# llm_chatbot


**Description:**  
Caring and empathetic chatbot for hospitals. Helps with patient data collection and provides dashboard functions.  

**Frontend:** React, Next.js, TypeScript, Material UI, no Tailwind  

**Backend:** Python with FastAPI and Ollama


## Folder structure

General structure:

```
llm_chatbot/
│
├── frontend/             # React app source code
├── backend/              # Python backend services / logic
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Set up Python server (with fastapi and uvicorn)

### Environment for python
create and activate environment first and then: (for example with "python -m venv .venv && .venv\Scripts\activate")
```
cd "C:\Users\...your_path...\llm_chatbot\backend\"
pip install -r requirements.txt

```


### Start Python Fastapi Server
Keep in mind: activate or deactivate sql database in fastapi_server_w_db.py (at the top of the script - simplified_db_version = True) if needed. And also: the ollama model specified n config.yaml has to be downloaded.
```
cd "C:\Users\...your_path...\llm_chatbot\backend\"
venv\Scripts\activate
uvicorn fastapi_server_w_db:app --host 127.0.0.1 --port 5000 --reload
```




### Ollama model environment

Go to the official Ollama website to download the ollama program.
llama3.2:1b is the smallest model - 1.3GB.
```
ollama pull llama3.2:1b 
ollama list
```

## Set up React next.js app


### 1. Make sure Node.js is installed (version 18+ recommended)
node -v
npm -v

### 2. Create a new Next.js app
npx create-next-app@latest llm_chatbot

### OR using npm init
### npm init next-app@latest llm_chatbot

### 3. Move into your project folder
cd llm_chatbot

### 4. Install dependencies (React, React-DOM, Next are usually already installed)
npm install react react-dom next

### Optional: install other common libraries (HTTP requests, UI components)
npm install axios                   # for API calls
npm install @mui/material @emotion/react @emotion/styled  # for Material UI components

### 5. Run the development server
npm run dev



