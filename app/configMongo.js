var mongoose = require('mongoose');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost:27017/db');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  password: String,
  createdAt: Date,
  updatedAt: Date
});


var linkSchema = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  createdAt: Date,
  updatedAt: Date
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.methods.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

linkSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

var User = mongoose.model('User', userSchema);
var Link = mongoose.model('Link', linkSchema);

module.exports.User = User;
module.exports.Link = Link;
// module.exports.Users = Users;
// module.exports.Links = Links;
