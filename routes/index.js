
/*
 * GET home page.
 */

var db = require('../DB/dbQuery');

exports.index = function(req, res){
  db.getFoods();

};