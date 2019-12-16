const env = process.env.NODE_ENV || 'development'
const config = require('../config.json')[env];

const bcrypt = require('bcryptjs')
const BCRYPT_SALT_ROUNDS = config.salt_length

const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const jwtStrategy = require('passport-jwt').Strategy
const extractJwt = require('passport-jwt').ExtractJwt
const db = require('../../models')

let jwtOptions = {}
jwtOptions.secretOrKey = 'c0d3c4mp4'

passport.use('register', new localStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    session: false,
  },
  (username, password, done) => {
    console.log("inside passport")
    db.user.findOne({
      where: { username: username }
    }).then(user => {
      // done(error, user, info)
      if (user !== null) {
        console.log('Username already taken')
        return done(null, false, { message: 'username already taken' });
      } else {
        let salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
        let hashedPassword = bcrypt.hashSync(password, salt);
        db.user.create({ username, password: hashedPassword })
          .then(user => {
            console.log("user created")
            return done(null, user)
          })
          .catch(err => {
            console.error(err)
            done(err)
          })
      }
    })
  }
))
