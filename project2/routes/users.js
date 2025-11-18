var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  let user = true
  res.render('user/home',{user});
});

module.exports = router;
