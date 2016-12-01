var mongoose = require('mongoose');
var path = require('path');

mongoose.connect('mongodb://localhost/app/db');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  password: String,
  createdAt: Date,
  updatedAt: Date
});


var linkSchema = new Schema({
  url: String,
  shortUrl: String,
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

linkSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

var User = mongoose.model('User', userSchema);
var Link = mongoose.model('Link', linkSchema);

exports.modules.User = User;
exports.modules.Link = Link;
