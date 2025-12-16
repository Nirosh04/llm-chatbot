# llm_chatbot

llm_chatbot is a project that integrates a Flutter frontend with a Python backend. Flutter provides the main cross-platform frontend, while Flet offers a lightweight Python-based frontend for users who do not have Flutter installed. The backend is powered by Fastapi and can host language model interactions.


## Folder structure

General structure:

```
llm_chatbot/
│
├── frontend/             # Flutter app source code
├── backend/              # Python backend services / logic
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## First steps

## Environment for python
create and activate environment first and then: (for example with "python -m venv .venv && .venv\Scripts\activate")
```
cd "C:\Users\...your_path...\llm_chatbot\backend\"
pip install -r requirements.txt

```


## Ollama model environment

Go to the official Ollama website to download the ollama program.
llama3.2:1b is the smallest model - 1.3GB.
```
ollama pull llama3.2:1b 
ollama list
```

## Set up React next.js app
After downloading ..
```
cd "C:\Users\...your_path...\llm_chatbot\frontend\"
npm install # handles installs
```



## Start React Frontend
```
cd "C:\Users\...your_path...\llm_chatbot\frontend\"
npm run dev
```




## Start Python Fastapi Server
Keep in mind: activate or deactivate sql database in fastapi_server_w_db.py (at the top of the script - simplified_db_version = True) if needed. And also: the ollama model specified n config.yaml has to be downloaded.
```
cd "C:\Users\...your_path...\llm_chatbot\backend\"
venv\Scripts\activate
uvicorn fastapi_server_w_db:app --host 127.0.0.1 --port 5000 --reload
```


