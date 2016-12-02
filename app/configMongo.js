var mongoose = require('mongoose');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');

mongoose.connect('mongodb://localhost:27017/data/db');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, index: {unique: true} },
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
  this.hashPassword(next);
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.methods.hashPassword = function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
      return this;
    });
};

linkSchema.methods.hashLink = function() {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);  
};

linkSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  this.hashLink();
  next();
});

var User = mongoose.model('User', userSchema);
var Link = mongoose.model('Link', linkSchema);

module.exports.User = User;
module.exports.Link = Link;
// module.exports.Users = Users;
// module.exports.Links = Links;
