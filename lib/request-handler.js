var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var mongodb = require('../app/configMongo');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  mongodb.Link.find({}).then(function(links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  mongodb.Link.findOne({ url: uri })
    .then(function(link) {
      if (link) {
        res.status(200).send(link);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }
          var newLink = new mongodb.Link({
            url: uri,
            title: title,
            baseUrl: req.headers.origin,
            visits: 0
          });
          newLink.save().then(function(newLink) {
            res.status(200).send(newLink);
          });
        });
      }
    });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  mongodb.User.findOne({username: username}, 'username password')
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  mongodb.User.findOne({ username: username })
    .then(function(user) {
      if (!user) {
        var newUser = new mongodb.User({
          username: username,
          password: password
        });
        newUser.save()
          .then(function(newUser) {
            util.createSession(req, res, newUser);
          });
      } else {
        res.redirect('/signup');
      }
    });

};

exports.navToLink = function(req, res) {
  mongodb.Link.find({code: req.params[0]}).then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link[0].visits++;
      link[0].save().then(function() {
        return res.redirect(link[0].url);
      });
    }    
  });
};