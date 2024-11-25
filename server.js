const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');

const url = process.env.ATLAS_CONNECT_STRING.replace(
  '<PASSWORD>',
  process.env.MONGO_ATLAS_PASSWORD
);

// Handling uncaughtException eg.(unintialized, referenceError) //

process.on('uncaughtException', (err) => {
  console.log(err.name, ':', err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

mongoose
  .connect(url)
  .then(() => {
    console.log('DB Connected.');
  })
  .catch((err) => {
    console.error('Error ', err);
  });

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Listning on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, ':', err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
