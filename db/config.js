const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const MONGO_URL = process.env.MONGO_URL;

try {
  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true }
  );
} catch (err) {
  mongoose.createConnection(MONGO_URL, { useNewUrlParser: true });
}

mongoose.connection
  .once('open', () => console.log('mongodb instance running...'))
  .on('error', err => console.error(err));
