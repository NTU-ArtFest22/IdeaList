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
  slackKey: 'IMPJXUedcy3tDvlLEdRGD1v3',
  slackTeam: 'ntuaf',
  slackErrorChannel: '#error',
  facebook:{
    clientID:'1017275854991795',
    clientSecret: 'abcbff20a14c8b9e33eb3171c110265e',
    callbackURL: 'http://localhost:3000/login/facebook/callback'
  }
};