import yaml
import logging
from utils import load_config, setup_logger


def get_llm_output(user_input):
    llm_output = f'got user input "{user_input[:8]}"...\nDUMMY ANSWER - implement real model' 
    
    return llm_output


# Load config and create logger when imported
config = load_config()
logger = setup_logger()


logger.info('logger (info) test 1')
logger.debug('logger (debug) test 1')



