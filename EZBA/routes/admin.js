var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const adminHelper = require('../helpers/admin-helper');
const turfHelpers = require('../helpers/turf-helpers');
const evHelper = require('../helpers/ev-helper');
const fs = require('fs');
const { isMarkedAsUntransferable } = require('worker_threads');
const poolHelper = require('../helpers/pool-helper');
const hallHelper = require('../helpers/hall-helper');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
}


/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  let admin = req.session.admin
  if (req.session.adminLoggedIn) {
    res.render('admin/admin-home', {admin});
  } else {
    res.redirect('admin/admin-login')
  }
});

router.get('/admin-login', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin-login', { "loginErr": req.session.adminLoginErr});
    req.session.adminLoginErr = false
  }
});

router.post('/admin-login', function (req, res, next) {
  adminHelper.doLoginAdmin(req.body).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    } else {
      req.session.adminLoginErr = "Invalid email or password"
      res.redirect('admin/admin-login')
    }
  })
});

router.get('/admin-signup', function (req, res, next) {
  res.render('admin/admin-signup');
});

router.post('/admin-signup', function (req, res, next) {
  adminHelper.doSignupAdmin(req.body).then((response) => {
    req.session.adminLoggedIn = true
    req.session.admin = response.admin
    res.redirect('/admin')
  })
});

router.get('/admin-logout', verifyLogin, function (req, res) {
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin')
});

router.get('/add-form', verifyLogin, function (req, res) {
  res.render('admin/add-form', { admin: true });
});

router.post('/add-form', verifyLogin, function (req, res) {
  console.log(req.body);
  console.log(req.files.Image);
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-form", { admin: true })
      }
    })
    res.redirect('/admin')
  })
});

router.get('/delete/:id', verifyLogin, async function (req, res) {
  let proId = req.params.id
  console.log(req.params.id)
  productHelpers.deleteProduct(proId).then((result) => {
    console.log(result)
    res.redirect('/admin')
    const imagePath = './public/product-images/' + proId + '.jpg';
    console.log(proId)
    if (fs.existsSync(imagePath)) { // Check if the file exists
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error while deleting the image:', err);
        } else {
          console.log('Image successfully deleted');
        }
      });
    } else {
      console.log('Image does not exist');
    }
  })
});

router.get('/edit-product/:id', verifyLogin, async function (req, res) {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product)
  res.render("admin/edit-product", { product, admin: true })
});

router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  console.log(id)
  productHelpers.updateProduct(req.body, req.params.id).then((result) => {
    console.log(result)
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
});

router.get('/dashboard', verifyLogin, async function (req, res, next) {
  let admin = req.session.user
  await adminHelper.getalluser((data) => {
    res.render('admin/dashboard', { data, admin, admin: true });
  })
});

router.get('/accept-user/:id', verifyLogin, async (req, res) => {
  let userId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.acceptUser(userId).then((result) => {
    console.log(result)
    res.redirect('/admin/dashboard')
  })
});

router.post('/accept-user/:id', verifyLogin, () => {
});

router.get('/delete-user/:id', verifyLogin, async (req, res) => {
  let userId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.deleteUser(userId).then((result) => {
    console.log(result)
    res.redirect('/admin')
  })
});

router.post('/delete-user/:id', verifyLogin, () => {
});

router.get('/view-all-turf',verifyLogin,  function (req, res, next) {
  turfHelpers.getAllTurf((turfs) => {
    console.log(req.session.user)
    res.render('admin/view-all-turf', { turfs, admin: true });
  })
});

router.get('/view-all-ev', verifyLogin, function (req, res, next) {
  evHelper.getAllStation((stations) => {
    console.log(req.session.user)
    res.render('admin/view-all-ev', { stations, admin: true });
  })
});

router.get('/view-all-pool',verifyLogin,  function (req, res, next) {
  poolHelper.getAllPool((pools) => {
    console.log(req.session.user)
    res.render('admin/view-all-pool', { pools, admin: true });
  })
});

router.get('/view-all-hall',verifyLogin,  function (req, res, next) {
  hallHelper.getAllHall((halls) => {
    console.log(req.session.user)
    res.render('admin/view-all-hall', { halls, admin: true });
  })
});

router.get('/delete-turf/:id', verifyLogin, async (req, res) => {
  let turfId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.deleteTurf(turfId).then((result) => {
    res.redirect('/admin')
  })
});

router.get('/delete-ev/:id', verifyLogin, async (req, res) => {
  let evId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.deleteEv(evId).then((result) => {
    res.redirect('/admin')
  })
});

router.get('/delete-pool/:id', verifyLogin, async (req, res) => {
  let poolId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.deletePool(poolId).then((result) => {
    res.redirect('/admin')
  })
});

router.get('/delete-hall/:id', verifyLogin, async (req, res) => {
  let hallId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.deleteHall(hallId).then((result) => {
    res.redirect('/admin')
  })
});

router.get('/view-ev-details/:id', verifyLogin, async (req, res) => {
  let evId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.getEvDetails(evId).then((ev) => {
    res.render('admin/view-ev-details', { evId, ev, admin: true })
  })
});

router.get('/view-turf-details/:id', verifyLogin, async (req, res) => {
  let turfId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.getTurfDetails(turfId).then((turf) => {
    res.render('admin/view-turf-details', { turfId, turf, admin: true })
  })
});

router.get('/view-pool-details/:id', verifyLogin, async (req, res) => {
  let poolId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.getPoolDetails(poolId).then((pool) => {
    res.render('admin/view-pool-details', { poolId, pool, admin: true })
  })
});

router.get('/view-hall-details/:id', verifyLogin, async (req, res) => {
  let hallId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  adminHelper.getHallDetails(hallId).then((hall) => {
    res.render('admin/view-hall-details', {hallId, hall, admin: true })
  })
});

router.get('/admin-profile', verifyLogin, async function (req, res, next) {
  let userId=req.session.admin._id
  await userHelper.getUserDetails(userId).then((user)  => {
    console.log("userData",user)
      res.render('admin/profile', { user, admin: true });
  })
});

router.post('/admin-profile', verifyLogin,  (req, res) => {
  const id=req.session.admin._id
  console.log("hello",req.body)
  userHelper.updateUserDetails(id, req.body).then(() => {
    res.redirect('/admin')
  })
});

router.get('/view-users', async function (req, res, next) {
  await adminHelper.getAllUser((users) => {
    res.render('admin/view-users', { users, admin: true });
  })
});

router.get('/view-bookings', async function (req, res, next) {
  await adminHelper.getAllBooking((bookings) => {
    res.render('admin/view-bookings', { bookings, admin: true });
  })
});

module.exports = router;
