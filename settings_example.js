module.exports = {
  cookieSecret: 'cookieSecret',
  sessionSecret: 'sessionSecret',
  db: 'idea_list',
  host: 'localhost',
  port: 3000,
  session: {
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  emailFrom: 'Email Server <email_server@mail.com>',
  mongooseDebug: false,
  slackKey: 'slack_key',
  slackTeam: 'ntuaf',
  slackErrorChannel: '#error',
  facebook:{
    clientID:'1017275854991795',
    clientSecret: 'clientSecret',
    callbackURL: 'http://localhost:3000/login/facebook/callback'
  }
};