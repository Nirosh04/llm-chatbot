from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import base64
import os
from typing import Optional

r'''


cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python simple_chat_w_flet.py



cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python fastapi_server_app.py

'''

app = FastAPI()

class SignalResponse(BaseModel):
    prediction: int

@app.post('/check_signal', response_model=SignalResponse)
async def check_signal():
    # Return a single number in a JSON response
    return SignalResponse(prediction=1)


class ModelsResponse(BaseModel):
    models: list[str]

@app.get('/list-models', response_model=ModelsResponse)
async def list_models():
    try:
        models_dir = './llm_models'
        filter_string = 'llm'  # Replace with the specific substring you want to filter for

        if not os.path.exists(models_dir):
            raise HTTPException(status_code=404, detail='Models directory not found')

        # Get only files with the specified substring in their name
        models = [
            f for f in os.listdir(models_dir)
            if os.path.isfile(os.path.join(models_dir, f)) and filter_string in f
        ]

        return ModelsResponse(models=models)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SetModelRequest(BaseModel):
    model_name: str

class SetModelResponse(BaseModel):
    success: bool
    message: str

@app.post('/set-model', response_model=SetModelResponse)
async def set_model(request: SetModelRequest):
    try:
        model_name = request.model_name

        if not model_name:
            raise HTTPException(status_code=400, detail='No model name provided')

        models_dir = 'llm_models'
        model_path = os.path.join(models_dir, model_name)

        if not os.path.isfile(model_path):
            raise HTTPException(status_code=404, detail=f'Model {model_name} does not exist')

        # model as to actually be set

        # Simulate model loading
        print(f"Model {model_name} loaded successfully.")
        return SetModelResponse(
            success=True, 
            message=f'Model {model_name} set successfully'
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class LLMRequest(BaseModel):
    input: str

class LLMResponse(BaseModel):
    output: str

@app.post('/get-llm-response', response_model=LLMResponse)
async def get_llm_response(request: LLMRequest):
    try:        
        user_input = request.input

        # TODO: replace with real LLM call
        response_text = f"Dummy answer for: {user_input[:5]}... - implement llm answer"

        return LLMResponse(output=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=5000)