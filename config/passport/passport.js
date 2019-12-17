const env = process.env.NODE_ENV || 'development'
const config = require('../config.json')[env];

const bcrypt = require('bcryptjs')
const BCRYPT_SALT_ROUNDS = config.salt_length

const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
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

passport.use('login', new localStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    session: false,
  }, async (username, password, done) => {
    let user = await db.user.findOne({ where: { username } })
    if (user === null) {
      return done(null, false, { message: 'username or password is incorrect.' })
    }
    bcrypt.compare(password, user.password, function (err, response) {
      if (err) {
        console.error(err)
        done(err)
      }
      if (!response) {
        return done(null, false, { message: 'username or password is incorrect.' })
      }
      console.log(`user ${user.id} is found  & authenticated`)
      return done(null, user)
    })
  }
))

const opts = {
  jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtOptions.secretOrKey
}

passport.use('jwt', new JWTStrategy(opts, (jwt_payload, done) => {
  console.log({ jwt_payload })
  db.user.findOne({ where: { id: jwt_payload.id } })
    .then(user => {
      if (user) {
        console.log("user found")
        done(null, user)
      } else {
        console.log("user is not found")
        done(null, false)
      }
    })
}))

module.exports = jwtOptions