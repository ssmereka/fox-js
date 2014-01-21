/**
 * Default configuration object for the backend server.
 */
module.exports = {
  environment: 'local',

  host: 'localhost',
  port: '3000',
  protocol: 'https',
  debug: true,

  title: 'Fox App',

  mongodb: {
    enabled: true,
    useAuthentication: false,
    host: 'localhost',
    port: '27017',
    database: 'fox_local'
  }
};