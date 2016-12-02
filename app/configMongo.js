var mongoose = require('mongoose');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');

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
  this.hashPassword(next);
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  console.log('CALLING COMAPRE');
  console.log('attemptedPassword', attemptedPassword);
  console.log('this.password', this.password);
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.methods.hashPassword = function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  console.log('HASHPASSWORD IS RUNNING');
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
  // bcrypt.hash(this.password, null, null, function(err, hash) {
  //   this.password = hash;
  //   next();
  // });
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
