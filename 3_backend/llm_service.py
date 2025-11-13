import yaml
import logging
import utils


def get_llm_output(user_input):
    llm_output = f'got user input "{user_input[:8]}"...\nDUMMY ANSWER - implement real model' 
    
    return llm_output


# Load config and create logger when imported
config = utils.load_config()
logger = utils.setup_logger()


logger.info('logger (info) test 1')
logger.debug('logger (debug) test 1')



