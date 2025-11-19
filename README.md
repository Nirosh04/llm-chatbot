# llm_chatbot

llm_chatbot is a project that integrates a Flutter frontend with a Python backend. Flutter provides the main cross-platform frontend, while Flet offers a lightweight Python-based frontend for users who do not have Flutter installed. The backend is powered by Fastapi and can host language model interactions.


## Folder structure

General structure:

```
llm_chatbot/
│
├── 1_frontend/             # Flutter app source code
├── 2_backend/              # Python backend services / logic
├── venv/                   # Python virtual environment 
├── .gitignore              # Git ignore rules
└── README.md               # This file
```


Flutter part:
```
1_frontend/
└── lib/
    ├── main.dart                  # Main entry point for the Flutter app
    ├── dummy_frontend/            # Flet and GRADIO is in here - not relevant for the final product
    ├── frontend/                  # Flutter frontend components
    │   ├── atoms.dart             # Atomic UI components
    │   └── utils_components.dart  # Utility UI components
    └── server_backend/                   # Backend integration scripts
        └── http_backend.dart    # Dart script to communicate with Python backend
```



Python backend:
```
llm_chatbot/
└── backend/
    ├── fastapi_server_app.py      # Fastapi server application
    ├── database/                  # database files in sql
    ├── llm_service.py             # Main Script for using the llm
    ├── utils.py                   # Script w useful functions like logger etc
    ├── venv/                      # Python virtual environment
    ├── config.yml                 # YAML for configuration
    ├── health_summary.json        # JSON for health summary structure
    ├── lumee_prompt.py            # lumee_prompts - maybe better to use json in the future
    └── README.md                  # Project documentation
```


## Environment for python

See requirements.txt


## Ollama model environment

Go to the official Ollama website to download the ollama program.
llama3.2:1b is the smallest model - 1.3GB.
```
ollama pull llama3.2:1b 
ollama list
```

## Environment for Flutter

Search for FLutter install tutorial.
The IDE VSCODE is required. USE Visual Studio Installer 2022 (not 2019)

## Start Flutter app
Keep in mind: To successfully connect to the python backend you need to activate the fastapi server (see below: "Start Python Fastapi Server"). Use web-app instead of a native app when starting the app.
```
cd C:\Users\...your_path...\llm_chatbot\1_frontend\
flutter run
2
 ```

## Start Flet app
Keep in mind: This is a a dummy frontend for the backend group. The final product won't include flet.
```
cd "C:\Users\...your_path...\llm_chatbot\"
venv\Scripts\activate
cd 1_frontend/dummy_frontend
python simple_chat_w_flet.py
```

## Start Python Fastapi Server
Keep in mind: activate or deactivate sql database in fastapi_server_w_db.py (at the top of the script - simplified_db_version = True) if needed. And also: the ollama model specified n config.yaml has to be downloaded.
```
cd "C:\Users\...your_path...\llm_chatbot\"
venv\Scripts\activate
cd backend
uvicorn fastapi_server_w_db:app --host 127.0.0.1 --port 5000 --reload
```




## Coding Conventions

To maintain a clean and maintainable codebase, the following conventions are used throughout this project:

### Logging
- Use `logger.info()` and `logger.debug()` **instead of** `print()`.
- This ensures:
  - More control over output levels and verbosity.
  - Easier integration with monitoring and debugging tools.
  - Alignment with widely adopted practices in professional software projects.

### Configuration Management
- All adjustable settings are stored in `config.yaml`.
- This allows:
  - Modifying configuration values without searching through the codebase.
  - Easier sharing and version control of configuration settings.
