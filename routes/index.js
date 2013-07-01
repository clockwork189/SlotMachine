var cons = require("consolidate");

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html', { title: 'Spin To Win' });
};
exports.privacy = function(req, res){
  res.render('privacy.html', { title: 'Spin To Win: Privacy Policy' });
};