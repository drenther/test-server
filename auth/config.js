const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const jwt = require('jsonwebtoken');

const UserModel = require('../db/user.model');

passport.use(
  'signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
      session: false,
    },
    async function(req, email, password, done) {
      try {
        const name = req.body.name;
        const user = await UserModel.create({ email, name, password });
        return done(null, user, { message: 'New user created successfully!' });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async function(email, password, done) {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'User not found!' });
        }

        const isPasswordCorrect = await user.isCorrectPassword(password);
        if (!isPasswordCorrect) {
          return done(null, false, { message: 'Wrong Password!' });
        }

        return done(null, user, { message: 'Logged in successfully!' });
      } catch (err) {
        return done(err);
      }
    }
  )
);

const jwtOpts = {
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
};

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest(req) {
        if (req && req.cookies) {
          return req.cookies['AUTH-TOKEN'];
        }
        return null;
      },
      passReqToCallback: true,
      ...jwtOpts,
    },
    async function(req, payload, done) {
      const csrfString = jwt.verify(req.headers['x-xsrf-token'], process.env.JWT_SECRET, jwtOpts).csrfString;

      if (csrfString !== payload.csrfString) {
        return done(null, false, { message: 'Invalid token pair!' });
      }

      try {
        const user = await UserModel.findById(payload.id);

        if (!user) {
          return done(null, false, { message: 'Invalid user id!' });
        }
        return done(null, user, { message: 'Valid user!' });
      } catch (err) {
        return done(err);
      }
    }
  )
);
