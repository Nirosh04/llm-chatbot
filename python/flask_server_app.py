from flask import Flask, request, jsonify, send_file
import base64
import os

r'''


cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python simple_chat_w_flet.py



cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python flask_server_app.py

'''




app = Flask(__name__)



"""


███████ ██  ██████  ███    ██  █████  ██          ████████ ███████ ███████ ████████ 
██      ██ ██       ████   ██ ██   ██ ██             ██    ██      ██         ██    
███████ ██ ██   ███ ██ ██  ██ ███████ ██             ██    █████   ███████    ██    
     ██ ██ ██    ██ ██  ██ ██ ██   ██ ██             ██    ██           ██    ██    
███████ ██  ██████  ██   ████ ██   ██ ███████        ██    ███████ ███████    ██    
                                                                                                                          
"""
    


@app.route('/check_signal', methods=['POST']) # creates the jsonified value "prediction:2" and the server sends it back to dart backend
def check_signal():
    # Return a single number in a JSON response

    return jsonify({'prediction': 1})








"""


    ██████  ██    ██ ████████ ██████  ██    ██ ████████ 
   ██    ██ ██    ██    ██    ██   ██ ██    ██    ██    
   ██    ██ ██    ██    ██    ██████  ██    ██    ██    
   ██    ██ ██    ██    ██    ██      ██    ██    ██    
    ██████   ██████     ██    ██       ██████     ██    
                                                                                                     
                                                                                                     

"""



@app.route('/list-models', methods=['GET'])
def list_models():
    try:
        models_dir = './llm_models'
        filter_string = 'llm'  # Replace with the specific substring you want to filter for

        if not os.path.exists(models_dir):
            return jsonify({'error': 'Models directory not found'}), 404

        # Get only files with the specified substring in their name
        models = [
            f for f in os.listdir(models_dir)
            if os.path.isfile(os.path.join(models_dir, f)) and filter_string in f
        ]

        return jsonify({'models': models})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

    
@app.route('/set-model', methods=['POST'])
def set_model():
    try:
        data = request.get_json()
        model_name = data.get('model_name', None)

        if not model_name:
            return jsonify({'error': 'No model name provided'}), 400

        models_dir = 'llm_models'
        model_path = os.path.join(models_dir, model_name)

        if not os.path.isfile(model_path):
            return jsonify({'error': f'Model {model_name} does not exist'}), 404

        # model as to actually be set


        # Simulate model loading
        print(f"Model {model_name} loaded successfully.")
        return jsonify({'success': True, 'message': f'Model {model_name} set successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



@app.route('/get-llm-response', methods=['POST'])
def get_llm_response():
    try:        
        
        data = request.get_json()
        user_input = data.get('input', '')

        # TODO: replace with real LLM call
        response_text = f"Dummy answer for: {user_input[:5]}..."
        response = 'dummy answer to test connection to python - implement llm answer'

        return jsonify({'output': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)












