require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');

require('./db/config');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-XSRF-TOKEN'],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(passport.initialize());

require('./auth/config');

app.use('*', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.post('/auth/signup', function(req, res) {
  return passport.authenticate('signup', { session: false }, (err, user) => {
    if (err) {
      return res.json({ error: 'Error has occured' });
    }

    if (user) {
      const [authToken, csrfToken] = user.issueTokens();

      res.cookie('AUTH-TOKEN', authToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks
      });
      return res.json({ csrfToken });
    }
  })(req, res);
});

app.post('/auth/login', function(req, res) {
  return passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      return res.json({ error: 'Error has occured' });
    }

    if (user) {
      const [authToken, csrfToken] = user.issueTokens();

      res.cookie('AUTH-TOKEN', authToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks
      });
      return res.json({ csrfToken });
    }

    return res.json({ ...info });
  })(req, res);
});

app.get('/auth/logout', function(req, res) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.json({ error: 'Error has occured' });
    }

    if (user) {
      res.clearCookie('AUTH-TOKEN');
      return res.json({ data: `${user.name} logged out!` });
    }

    return res.json({ ...info });
  })(req, res);
});

app.get('/secure', function(req, res) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.json({ error: 'Error has occured' });
    }

    if (user) {
      return res.json({ data: `${user.name}'s secret data!` });
    }

    return res.json({ ...info });
  })(req, res);
});

app.get('/', function(req, res) {
  return res.json({ data: 'Public Data' });
});

const PORT = process.env.PORT;
app.listen(PORT, function() {
  console.log(`server up at port ${PORT}`);
});
