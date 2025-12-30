#!/bin/bash
set -e

/bin/ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama service to start..."
sleep 5

# Use environment variable or default
MODEL_NAME=${OLLAMA_MODEL:-llama3.2}
echo "Checking for model: $MODEL_NAME"

if ollama list | grep -q "$MODEL_NAME"; then
  echo "Model $MODEL_NAME already exists. Skipping download."
else
  echo "Downloading model: $MODEL_NAME..."
  ollama pull "$MODEL_NAME"
fi

echo "Ollama is ready!"

wait $OLLAMA_PID