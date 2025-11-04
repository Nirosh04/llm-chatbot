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
                                                                                    

@app.route('/check-text-exchange', methods=['POST'])
def check_text_exchange():
    try:
        # Retrieve image bytes from the request body
        text_bytes = request.data

        # implement missing code

        # Convert the processed image back to bytes
        byte_io = io.BytesIO()
        byte_io.seek(0)

        # Return the processed image as a binary response
        return send_file(
            byte_io,
            mimetype='text????',
            as_attachment=False  # Optionally, use True to trigger download
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500                                                                            
"""
    


@app.route('/check_signal', methods=['POST'])
def check_signal():
    # Return a single number in a JSON response
    return jsonify({'prediction': 2})








"""


███    ███  ██████  ██████  ███████ ██           ██████  ██    ██ ████████ ██████  ██    ██ ████████ 
████  ████ ██    ██ ██   ██ ██      ██          ██    ██ ██    ██    ██    ██   ██ ██    ██    ██    
██ ████ ██ ██    ██ ██   ██ █████   ██          ██    ██ ██    ██    ██    ██████  ██    ██    ██    
██  ██  ██ ██    ██ ██   ██ ██      ██          ██    ██ ██    ██    ██    ██      ██    ██    ██    
██      ██  ██████  ██████  ███████ ███████      ██████   ██████     ██    ██       ██████     ██    
                                                                                                     
                                                                                                     




@app.route('/get-model-output', methods=['POST'])
def get_model_output():
    try:
        # Retrieve image bytes from the request body
        image_bytes = request.data

        # implement ... 


        byte_io = io.BytesIO(buffer)

        # Return the processed image as a binary response
        return send_file(
            byte_io,
            mimetype='text????',
            as_attachment=False  # Optionally, use True to trigger download
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
    



if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)












