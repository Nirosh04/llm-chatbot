# Hospital Assistant --- AI Companion

A collaborative university project that prototypes an AI-supported
companion for patients and accompanying people waiting in a hospital
emergency department (ED).

The application helps users describe symptoms and relevant medical
history in a structured way, while also supporting selected
navigation-related questions. It combines a web frontend, a FastAPI
backend, LangGraph-based conversation orchestration, and containerised
supporting services.

> **Project Context:** Collaborative university project
> developed at Freie Universität Berlin. My primary area
> of contribution was backend and database development.

> **Disclaimer:** Academic prototype for demonstration
> purposes only. Not intended for clinical use or
> medical decision-making. Do not enter real patient
> data or personal health information.

## My contribution

My primary area of work in this team project was **backend and
database-related development**.

The repository includes backend components for: - FastAPI endpoints for
session creation, message processing, session retrieval, reset,
summaries, and service health. - Backend orchestration of conversational
workflows using LangGraph. - Integration with an Ollama model
endpoint. - PostgreSQL schema and database-access components for session
and message records. - Container-based development and service
configuration.

The project was developed collaboratively. This section describes my
main area of focus and does not claim sole authorship of the complete
application.

## System overview

``` text
┌──────────────────────────────┐
│       Web frontend           │
│  Next.js · React · TypeScript│
│          Material UI         │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│        FastAPI backend       │
│                              │
│  Session API · Services      │
│  LangGraph orchestration     │
│  Ollama integration          │
└───────┬───────────────┬──────┘
        │               │
        ▼               ▼
┌───────────────┐  ┌────────────────┐
│  PostgreSQL   │  │  Ollama API    │
│ schema and    │  │ model inference│
│ DB services   │  └────────────────┘
└───────────────┘

        ┌────────────────┐
        │     Qdrant     │
        │ vector service │
        └────────────────┘
```

The Docker Compose configuration defines the frontend, backend,
PostgreSQL, and Qdrant services. The Ollama container definition is
currently commented out; the backend therefore needs an Ollama endpoint
that is reachable from its runtime environment. The project also
contains optional SSH-tunnel support for connecting to a remote Ollama
host.

## Backend and conversation workflow

The backend is implemented in Python with FastAPI. Its session API
includes endpoints to:

  -----------------------------------------------------------------------------------------------
  Method                  Endpoint                                        Purpose
  ----------------------- ----------------------------------------------- -----------------------
  `POST`                  `/api/sessions`                                 Create a conversation
                                                                          session

  `POST`                  `/api/sessions/{session_id}/get-llm-response`   Process a user message
                                                                          and return an assistant
                                                                          response

  `GET`                   `/api/sessions/{session_id}`                    Retrieve session
                                                                          details

  `DELETE`                `/api/sessions/{session_id}`                    Delete a session

  `POST`                  `/api/sessions/{session_id}/reset`              Reset conversation
                                                                          state

  `GET`                   `/api/sessions/{session_id}/summary`            Retrieve a structured
                                                                          summary

  `GET`                   `/health`                                       Check backend
                                                                          dependencies
  -----------------------------------------------------------------------------------------------

The LangGraph workflow separates the conversation into specialised
steps:

1.  **Classifier** --- determines whether a message is medical,
    navigation-related, or off-topic.
2.  **Extractor** --- extracts structured information from medical
    conversations.
3.  **Refiner** --- refines the extracted information.
4.  **Companion** --- generates the user-facing response.
5.  **Navigation / off-topic paths** --- handle their respective message
    categories.

The graph uses LangGraph's `MemorySaver` checkpointer for in-memory
conversation state, keyed by session ID.

## Database and state management

The repository contains a PostgreSQL schema with: - A `sessions`
table. - A `messages` table linked to sessions through a foreign key
with cascading deletion. - Indexes on `messages.session_id` and
`messages.created_at`.

A Python database-access service provides operations for creating
sessions, saving messages, retrieving conversation history, and checking
the database connection.

**Implementation note:** In the current `SessionService` implementation,
conversational state is managed through LangGraph's in-memory
`MemorySaver`. The PostgreSQL schema and database service are present in
the codebase, but the current session-processing path uses LangGraph
memory as its source of truth rather than persistent PostgreSQL
conversation history.

## AI and supporting services

-   **LangGraph** --- graph-based orchestration of classification,
    extraction, refinement, and response generation.
-   **Ollama** --- model inference through its HTTP API, including
    support for streamed responses.
-   **Qdrant** --- a vector-service component for collection management,
    embeddings, upserts, and similarity search.
-   **Sentence Transformers** --- generates text embeddings for the
    vector-service component.
-   **SSH tunnel support** --- optional connection to a remote Ollama
    host.

The Qdrant service module is included in the repository as a separate
component; the current LangGraph conversation flow does not demonstrate
a fully connected end-to-end retrieval-augmented generation pipeline.

## Frontend

The frontend is built with: - Next.js - React - TypeScript - Material UI

It provides the user-facing chat experience and screens for collecting
and presenting symptom and medical-history information. The source also
includes English and German localisation resources.

## Technology stack

  Area                     Technologies
  ------------------------ -----------------------------------------
  Backend                  Python, FastAPI, Pydantic
  Workflow orchestration   LangGraph
  Model serving            Ollama
  Database                 PostgreSQL, SQL, psycopg2
  Vector service           Qdrant, Sentence Transformers
  Frontend                 Next.js, React, TypeScript, Material UI
  Infrastructure           Docker, Docker Compose, Nginx
  Remote connectivity      SSH tunnelling

## Repository structure

``` text
.
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── nodes/
│   │   │   └── states/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── settings.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── i18n/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
├── schema.sql
├── docker-compose.yml
├── .env.example
└── ollama-entrypoint.sh
```

## Local setup

### Prerequisites

-   Docker Desktop or Docker Engine with the Docker Compose plugin.
-   A reachable Ollama instance and a model configured for the
    application.
-   An active university VPN connection if your configured Ollama host
    requires it.

### 1. Clone the repository

``` bash
git clone https://github.com/Nirosh04/llm-chatbot.git
cd llm-chatbot
```

### 2. Create local environment files

Copy the example configuration:

``` bash
cp .env.example .env
```

The Compose configuration also references `.env.local` for optional SSH
credentials. Create this file locally; it is ignored by Git:

``` bash
touch .env.local
```

If SSH tunnelling is enabled, add the required credentials to
`.env.local`:

``` dotenv
SSH_USER=your-user
SSH_PASSWORD=your-password
```

Do not commit `.env`, `.env.local`, passwords, tokens, or private keys.

### 3. Configure Ollama

Set `OLLAMA_HOST` in `.env` to an Ollama endpoint reachable from the
backend container.

For a remote university host, configure the SSH settings and enable
`USE_SSH` as appropriate. Access to university infrastructure may
require an active VPN and valid account permissions.

The Ollama service definition in `docker-compose.yml` is currently
commented out, so Compose does not start an Ollama container by default.

### 4. Start the application

``` bash
docker compose up --build -d
```

Stop the services with:

``` bash
docker compose down
```

The Compose configuration exposes: - Frontend: <http://localhost> -
Backend API: <http://localhost:5000> - FastAPI documentation:
<http://localhost:5000/docs> - Qdrant HTTP API: <http://localhost:6333>

PostgreSQL is exposed on port `5432` in the Compose configuration.

> The setup depends on the local environment and availability of the
> configured Ollama endpoint. The commands above document the
> repository's Compose workflow; they are not a claim that the
> application has been validated on every machine.

## Frontend-only development

To run the frontend independently:

``` bash
cd frontend
npm install
npm run dev
```

Then open <http://localhost:3000>.

The frontend development server requires a backend API endpoint for
application functionality.

## Security and data handling

-   Keep `.env` and `.env.local` local. They are excluded through
    `.gitignore`.
-   Use `.env.example` as a template and replace placeholders with local
    configuration.
-   Never commit real credentials, SSH passwords, API tokens, private
    keys, or personal data.
-   Use synthetic test data only. Do not upload real patient information
    or health records.
-   The application is an academic prototype and is not intended for
    clinical deployment.

## Project origin

This is a collaborative university project originally developed in the
Freie Universität Berlin GitLab project.

-   Original project: https://git.imp.fu-berlin.de/leok00/llm_chatbot
-   GitHub portfolio mirror: https://github.com/Nirosh04/llm-chatbot

The GitHub repository is maintained as a portfolio presentation of the
collaborative project. The original project and its contributors should
be credited accordingly.

```


