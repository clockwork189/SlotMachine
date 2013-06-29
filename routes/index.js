var cons = require("consolidate");

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Spin To Win' });
};