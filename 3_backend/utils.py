import yaml
import logging
import os

config_path = os.path.join(os.path.dirname(__file__), "config.yml")

def load_config(config_path=config_path):
    """Load YAML configuration file"""
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    return config

def setup_logger(name=__name__):
    """Setup and return a logger"""
    logger = logging.getLogger(name)

    if not logger.hasHandlers():  # only add handler once
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False  # prevent double logging to root

    return logger

def get_llm_output(user_input):
    llm_output = f'got user input "{user_input[:8]}"...\nDUMMY ANSWER - implement real model' 
    
    return llm_output


# Load config and create logger when imported
config = load_config()
logger = setup_logger()


logger.info('logger (info) test 1')
logger.debug('logger (debug) test 1')



