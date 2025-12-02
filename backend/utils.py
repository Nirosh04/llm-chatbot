import yaml
import logging
import os
import json


same_dir = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(same_dir, "config.yml")

def load_config(config_path=config_path):
    """Load YAML configuration file"""
    try:
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        return config
    except:
        return None

def setup_logger(level, name=__name__):
    """Setup and return a logger"""

    logger = logging.getLogger(name)

    if not logger.hasHandlers():  # only add handler once
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        #set this in config.yml
        if level == "DEBUG":
            # for devs
            logger.setLevel(logging.DEBUG)
        elif level == "INFO":
            # default
            logger.setLevel(logging.INFO)
        else:
            # mute all logging
            logger.setLevel(logging.WARNING)
        logger.propagate = False  # prevent double logging to root

    return logger

def get_health_summary_json_structure(as_str=True):
    """Load health summary JSON structure from file"""
    same_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(same_dir, "health_summary.json")
    
    with open(json_path, 'r') as file:
        json_data = json.load(file)
    
    return json.dumps(json_data) if as_str else json_data

# Load config and create logger when imported
config = load_config()
logger = setup_logger(config.get("log_level"))


#example of using the logger
#to be removed in the future
logger.info('logger (info) test from utils')
logger.debug('logger (debug) test from utils')



