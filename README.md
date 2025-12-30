# How to run the project

## These are the 3 quick steps to run the project

### 1: Install docker and docker compose

To run the project, you need to have **Docker** and **Docker Compose** installed on your system.

#### Windows

For both Windows and macOS, the recommended way to install Docker and Docker Compose is by downloading the **Docker Desktop** application. Docker Compose is included as part of the Docker Desktop installation.

1. **Download:** Go to the official [Docker Desktop download page](https://www.docker.com/products/docker-desktop/).
2. **Install:** Run the installer and follow the wizard's instructions.
3. **Verify:** After installation and starting Docker Desktop, open your command line and run:

```bash
docker --version
docker compose version
```

#### Linux

For Linux it depends too much on your OS so just google it yourself, if you managed to install Linux you can also manage this, you masochist!

### 2: Create local env file with ssh credentials

Create the file ```.env.local``` in the root of the project and add content like:

```(text)
SSH_USER=<your-fu-user>
SSH_PASSWORD=<your-fu-password>
```

### 3: Start the docker compose build

This will use docker compose to run the project in containers. Just run:

```(bash)
docker compose up --build -d
```

And when you want to stop the application:

```(bash)
docker compose down
```

### 4. How to access the application (Optional)

- You can then find the **frontend** at: [localhost](http://localhost/)
- And the **backend** at: [localhost:5000](http://localhost:5000/docs#/).

This will deploy the whole application (Frontend, Backend, and Database) to a Docker container.

## Coding Conventions

To maintain a clean and maintainable codebase, the following conventions are used throughout this project:

### Logging
- Use `logger.info()` and `logger.debug()` **instead of** `print()`.
- This ensures:
  - More control over output levels and verbosity.
  - Easier integration with monitoring and debugging tools.
  - Alignment with widely adopted practices in professional software projects.




# Additional way to only start React frontend (without Docker, LLM and database)

- Ideal for the frontend team when you want instant feedback on code changes.
- Running `npm run dev` starts the development server and updates the app in real time as you edit the code.


### 1. Make sure Node.js is installed (version 18+ recommended)
```(bash)
node -v
npm -v
```

### 2. Clone the project repository
```(bash)
git clone <your-repo-url> llm_chatbot    # choose repo link whose react code you want to use
cd llm_chatbot
```

### 3. Install dependencies
```(bash)
npm install   # installs all dependencies listed in package.json
```

### 4. Run the development server
```(bash)
npm run dev
```


