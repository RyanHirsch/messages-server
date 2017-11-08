import startApp from './app';
import config from './config';
import logger from './logger';

startApp(config.port)
  .then(server => {
    logger.info('Up and running', server.address().port);
  })
  .catch(err => {
    logger.error(err);
  });
