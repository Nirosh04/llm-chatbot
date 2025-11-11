import yaml
import logging

def load_config(config_path="llm_backend/config.yml"):
    """Load YAML configuration file"""
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    return config

def setup_logger(name=__name__):
    """Setup and return a logger"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Create console handler
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(handler)
    
    return logger


def get_llm_output(user_input):
    llm_output = f'got user input "{user_input[:8]}"...\nDUMMY ANSWER - implement real model' 
    
    return llm_output


# Load config and create logger when imported
config = load_config()
logger = setup_logger()


logger.info('logger (info) test 1')
logger.debug('logger (debug) test 1')



