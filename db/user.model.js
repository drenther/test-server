const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

const { Schema } = mongoose;

const MIN_PASS_LENGTH = 8;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required!'],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required!'],
    trim: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Invalid Email!',
    },
  },
  password: {
    type: String,
    required: [true, 'Passport is required!'],
    trim: true,
    minLength: [MIN_PASS_LENGTH, `Password needs to be longer than ${MIN_PASS_LENGTH} characters!`],
  },
});

UserSchema.pre('save', function(next) {
  const hash = bcrypt.hashSync(this.password, 10);
  this.password = hash;

  next();
});

UserSchema.methods.isCorrectPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.issueTokens = function() {
  const jwtOpts = {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    expiresIn: '30d',
  };

  csrfString = uuidv4();

  return [
    jwt.sign({ id: this._id.toString(), csrfString }, process.env.JWT_SECRET, jwtOpts),
    jwt.sign({ name: this.name.toString(), csrfString }, process.env.JWT_SECRET, jwtOpts),
  ];
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;
