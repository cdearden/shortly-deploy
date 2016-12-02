var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

// var db = require('../app/config');
var mongodb = require('../app/configMongo');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

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
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
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
        console.log('LINK EXISTS');
        res.status(200).send(link);
      } else {
        console.log('LINK DOESNT EXIST, SAVING INTO DB')
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }
          var newLink = new mongodb.Link({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          });
          console.log(newLink);
          newLink.save().then(function(newLink) {
            // Links.add(newLink);
            res.status(200).send(newLink);
          });
          // mongodb.Links.insert(newLink).then(function(records) {
          //   res.status(200).send(newLink);
          // });
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
          console.log("passwords match result", match);
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
        console.log('ABOUT TO SAVE');
        newUser.save()
          .then(function(newUser) {
            console.log('ABOUT TO SIGN IN ON NEW USER', newUser);
            util.createSession(req, res, newUser);
          });
      } else {
        res.redirect('/signup');
      }
    });

};

exports.navToLink = function(req, res) {
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
  mongodb.Link.find({code: req.params[0]}).then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      // link.set({ visits: link.get('visits') + 1 })
      //   .save()
      //   .then(function() {
      //     return res.redirect(link.get('url'));
      //   });
      link.visits++;
      res.redirect(link[0].url);
    }    
  });
};