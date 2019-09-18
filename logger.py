import logging


def getlogger(name):
    logger = logging.getLogger(name)
    # Logging format
    wmFormat = logging.Formatter(
        '[%(asctime)s][%(levelname)s][PID=%(process)d][%(filename)s:%(lineno)s] %(funcName)10s():: %(message)s')
    handler = logging.StreamHandler()
    handler.setFormatter(wmFormat)
    logger.addHandler(handler)
    logger.propagate = False
    logger.setLevel(logging.DEBUG)
    return logger
