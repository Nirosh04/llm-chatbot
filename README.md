# llm_chatbot

llm_chatbot is a project that integrates a Flutter frontend with a Python backend. Flutter provides the main cross-platform frontend, while Flet offers a lightweight Python-based frontend for users who do not have Flutter installed. The backend is powered by Fastapi and can host language model interactions.


## Folder structure

General structure:

```
llm_chatbot/
│
├── 1_frontend/             # Flutter app source code
├── 2_integration/          # Python FastAPI integration server
├── 3_backend/              # Python backend services / logic
├── venv/                   # Python virtual environment 
├── .gitignore              # Git ignore rules
└── README.md               # This file
```


Flutter part:
```
1_frontend/
└── lib/
    ├── main.dart                  # Main entry point for the Flutter app
    ├── frontend/                  # Flutter frontend components
    │   ├── atoms.dart             # Atomic UI components
    │   └── utils_components.dart  # Utility UI components
    └── backend/                   # Backend integration scripts
        └── python_backend.dart    # Dart script to communicate with Python backend
```

Python Integration (fastapi server):
```
llm_chatbot/
└── 2_integration/
    ├── fastapi_server_app.py        # Fastapi server application
```


Python backend:
```
llm_chatbot/
└── 3_backend/
    ├── simple_chat_w_flet.py      # Simple chat interface using Flet
    ├── llm_service.py             # Main Script for using the llm
    ├── llm_models/                # Folder for language model scripts or weights
    ├── venv/                      # Python virtual environment
    ├── config.yml/                # YAML for configuration
    └── README.md                  # Project documentation
```


## Environment for python

For now: flet, fastapi, uvicorn, yaml, etc.
backend: ollama 

## Environment for Flutter

Search for FLutter install tutorial.
The IDE VSCODE is required. USE Visual Studio Installer 2022 (not 2019)

## Start Flutter app
Keep in mind: To successfully connect to the python backend you need to activate the fastapi server (see below: "Start Python Fastapi Server")
```
cd C:\Users\...your_path...\llm_chatbot\1_frontend\
flutter run
1
 ```

## Start Flet app
Keep in mind: This is a a dummy frontend for the backend group. The final product won't include flet.
```
cd "C:\Users\...your_path...\llm_chatbot\"
venv\Scripts\activate
cd 3_backend
python simple_chat_w_flet.py
```

## Start Python Fastapi Server
Keep in mind: activate or deactivate sql database in fastapi_server_w_db.py (at the top of the script) if needed.
```
cd "C:\Users\...your_path...\llm_chatbot\"
venv\Scripts\activate
cd 2_integration
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
