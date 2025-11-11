# llm_chatbot

llm_chatbot is a project that integrates a Flutter frontend with a Python backend. Flutter provides the main cross-platform frontend, while Flet offers a lightweight Python-based frontend for users who do not have Flutter installed. The backend is powered by Fastapi and can host language model interactions.


## Folder structure

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

For now: flet, fastapi, uvicorn, yaml, 

## Environment for Flutter

Search for FLutter install tutorial.
The IDE VSCODE is required. USE Visual Studio Installer 2022 (not 2019)

## Start Flutter app
```
cd C:\Users\...your_path...\llm_chatbot\1_frontend\
flutter run
1
 ```

## Start Flet app
```
cd "C:\Users\...your_path...\llm_chatbot\"
venv\Scripts\activate
cd 3_backend
python simple_chat_w_flet.py
```

## Start Python Fastapi Server
```
cd "C:\Users\...your_path...\llm_chatbot\"
venv\Scripts\activate
cd 2_integration
python fastapi_server_app.py
```

