# llm_chatbot

A new Flutter project.

## Folder structure

Flutter part:
```
llm_chatbot/
└── lib/
    ├── main.dart                  # Main entry point for the Flutter app
    ├── frontend/                  # Flutter frontend components
    │   ├── atoms.dart             # Atomic UI components
    │   └── utils_components.dart  # Utility UI components
    └── backend/                   # Backend integration scripts
        └── python_backend.dart    # Dart script to communicate with Python backend
```


Python backend:
```
llm_chatbot/
└── python/
    ├── flask_server_app.py        # Flask server application
    ├── simple_chat_w_flet.py     # Simple chat interface using Flet
    ├── llm_models/                # Folder for language model scripts or weights
    ├── venv/                      # Python virtual environment - for now mainly flet and flask
    └── README.md                  # Project documentation
```


## Environment for python

flet and flask are needed. For now that's it.

## Environment for Flutter

Search for FLutter install tutorial.
The IDE VSCODE is required. USE Visual Studio Installer 2022 (not 2019)

## Start Flutter app
```
cd C:\Users\...your_path...\llm_chatbot
flutter run
1
 ```



## Start Flet app
```
cd "C:\Users\...your_path...\llm_chatbot\python"
venv\Scripts\activate
python simple_chat_w_flet.py
```




## Start Python Flask Server
```
cd "C:\Users\...your_path...\llm_chatbot\python"
venv\Scripts\activate
python flask_server_app.py
```

