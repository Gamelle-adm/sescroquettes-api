const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = require('./env');

const connectionOptions = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
};

module.exports = new MySQLStore(connectionOptions);