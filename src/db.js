import mongoose from 'mongoose';
import toJson from '@meanie/mongoose-to-json';
import config from './config';
import logger from './logger';

mongoose.plugin(toJson);
mongoose.Promise = global.Promise;

const db = mongoose.createConnection(`mongodb://${config.db.address}/${config.db.collection}`, {
  useMongoClient: true,
});
db.then(() => logger.info('Connected!'), err => logger.error(`connection error: ${err}`));
export default db;
