var mongoose = require('mongoose');
var path = require('path');

mongoose.connect('mongodb' + path.join(__dirname, '../db'));