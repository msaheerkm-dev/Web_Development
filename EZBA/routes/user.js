var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const turfHelpers = require('../helpers/turf-helpers');
const evHelper = require('../helpers/ev-helper');
const poolHelper = require('../helpers/pool-helper');
const hallHelper = require('../helpers/hall-helper');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');


const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// GET Forgot Password Page
router.get('/forgot-password', (req, res) => {
  res.render('user/forgot-password', { message: req.session.resetMessage });
  req.session.resetMessage = null;
});

// POST Forgot Password (Generate Reset Link)
router.post('/forgot-password', async (req, res) => {
  const { Email } = req.body;
  const token = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour expiration

  const user = await userHelper.findUserByEmail(Email);
  if (!user) {
    req.session.resetMessage = "No account with that email exists.";
    return res.redirect('/forgot-password');
  }

  await userHelper.saveResetToken(user._id, token, expires);

  // Send Reset Email (Assumes you have configured Nodemailer)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'your-email@gmail.com', pass: 'your-email-password' }
  });

  let mailOptions = {
    to: Email,
    from: 'your-email@gmail.com',
    subject: 'Password Reset',
    html: `<p>You requested a password reset.</p>
           <p>Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password.</p>`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error(err);
      req.session.resetMessage = "Error sending reset email.";
    } else {
      req.session.resetMessage = "Password reset link sent to your email.";
    }
    res.redirect('/forgot-password');
  });
});

// GET Reset Password Page
router.get('/reset-password/:token', async (req, res) => {
  const user = await userHelper.findUserByToken(req.params.token);
  if (!user) {
    return res.send('Password reset token is invalid or has expired.');
  }
  res.render('user/reset-password', { token: req.params.token });
});

// POST Reset Password (Update Password)
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const user = await userHelper.findUserByToken(req.params.token);

  if (!user) {
    return res.send('Token expired or invalid.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userHelper.updatePassword(user._id, hashedPassword);

  res.send('Password updated successfully! <a href="/login">Login</a>');
});

/* GET home page. */
router.get('/', verifyLogin, function (req, res, next) {
  let user = req.session.user
    res.render('user/home', { user });
});

router.get('/login', function (req, res, next) {
  if (req.session.UserLoggedIn) {
    if (req.session.user.role == 'User') {
      res.redirect('/')
    } else if (req.session.user.role == 'Turfmanager') {
      res.redirect('/turfmanager')
    } else if (req.session.user.role == 'Evmanager') {
      res.redirect('/evmanager')
    }else if (req.session.user.role == 'Hallmanager') {
      res.redirect('/hallmanager')
    } else {
      res.redirect('/poolmanager')
    }
  } else {
    res.render('user/login', { "loginErr": req.session.userLoginErr });
    req.session.userLoginErr = false
  }
});

router.get('/signup', function (req, res, next) {
  res.render('user/signup');
});

router.post('/signup', function (req, res, next) {
  userHelper.doSignup(req.body).then((response) => {
    req.session.userLoggedIn = true
    req.session.user = response.user
    if (response.user.Approval == true) {
      if (response.user.role == 'User') {
        res.redirect('/')
      } else if (response.user.role == 'Turfmanager') {
        res.redirect('/turfmanager')
      } else {
        res.redirect('/evmanager')
      }
    } else {
    }
  })
});


router.post('/login', function (req, res, next) {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true
      req.session.user = response.user
      if (response.user.Approval == true) {
        if (response.user.role == 'User') {
          res.redirect('/')
        } else if (response.user.role == 'Turfmanager') {
          res.redirect('/turfmanager')
        }else if (response.user.role == 'Poolmanager') {
          res.redirect('/poolmanager')
        } else if (response.user.role == 'Hallmanager') {
          res.redirect('/hallmanager')
        } else {
          res.redirect('/evmanager')
        }
      } else {
        res.send('Wait for Admin approval ...')
      }
    } else {
      req.session.userLoginErr = "Invalid email or password"
      res.redirect('/login')
    }
  })
});

router.get('/logout', function (req, res) {
  req.session.user = null
  res.redirect('/')
});

router.get('/home', function (req, res) {
  res.redirect('/')
});

router.get('/turf', function (req, res, next) {
  turfHelpers.getAllTurf((turfs) => {
    console.log(req.session.user)
    res.render('user/view-turf', { turfs, user: true });
  })
});

router.get('/ev', function (req, res, next) {
  evHelper.getAllStation((stations) => {
    console.log(req.session.user)
    res.render('user/view-ev', { stations, user: true });
  })
});

router.get('/pool', function (req, res, next) {
  poolHelper.getAllPool((pools) => {
    console.log(req.session.user)
    res.render('user/view-pool', { pools, user: true });
  })
});

router.get('/hall', function (req, res, next) {
  hallHelper.getAllHall((halls) => {
    console.log(req.session.user)
    res.render('user/view-hall', { halls, user: true });
  })
});

router.get('/view-slot-turf/:id', verifyLogin, async function (req, res, next) {
  let slotId = req.params.id
  let turfSlot = await turfHelpers.getSlots(slotId);
  res.render("user/view-slot-turf", { turfSlot, user: true})
});

router.get('/view-offer-turf/:id', verifyLogin, async function (req, res, next) {
  let offerId = req.params.id
  let turfOffer = await turfHelpers.getOffer(offerId);
  console.log(turfOffer)
  res.render("user/view-offer-turf", { turfOffer, user: true })
});

router.get('/view-slot-ev/:id', verifyLogin, async function (req, res, next) {
  let slotId = req.params.id
  let evSlot = await evHelper.getSlots(slotId);
  res.render("user/view-slot-ev", { evSlot, user: true })
});

router.get('/view-offer-ev/:id', verifyLogin, async function (req, res, next) {
  let offerId = req.params.id
  let evOffer = await evHelper.getOffer(offerId);
  res.render("user/view-offer-ev", { evOffer, user: true })
});

router.get('/view-hall-slot/:id', verifyLogin, async function (req, res, next) {
  let slotId = req.params.id
  let hallSlot = await turfHelpers.getSlots(slotId);
  res.render("user/view-hall-slot", { hallSlot, user: true })
});

router.get('/view-hall-offer/:id', verifyLogin, async function (req, res, next) {
  let offerId = req.params.id
  let hallOffer = await evHelper.getOffer(offerId);
  res.render("user/view-hall-offer", { hallOffer, user: true })
});

router.get('/feedback-turf/:id', verifyLogin, function (req, res, next) {
  managerId = req.params.id
  res.render('user/feedback-turf', { managerId, user: true });
});

router.post('/feedback-turf/:id', verifyLogin, function (req, res) {
  const feedback = req.body;
  const userId = req.session.user._id;
  const managerId = req.params.id

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  userHelper.addFeedbackTurf(feedback, managerId, userId)
    .then(() => {
      res.redirect('/turf');
    })
    .catch((err) => {
      console.error('Error adding turf:', err);
      res.status(500).send('Failed to add turf');
    });
});

router.get('/feedback-ev/:id', verifyLogin, function (req, res, next) {
  managerId = req.params.id
  console.log("managerid", managerId)
  res.render('user/feedback-ev', { managerId, user: true });
});

router.post('/feedback-ev/:id', verifyLogin, function (req, res) {
  const feedback = req.body;
  const userId = req.session.user._id;
  const managerId = req.params.id
  console.log(feedback)

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  userHelper.addFeedbackEv(feedback, userId, managerId)
    .then(() => {
      res.redirect('/ev');
    })
    .catch((err) => {
      console.error('Error adding turf:', err);
      res.status(500).send('Failed to add turf');
    });
});

router.get('/booking-ev', verifyLogin, function (req, res, next) {
  const bookingData = req.query;
  const userid = req.session.user._id
  console.log("userid", userid)
  userHelper.addBookingEv(bookingData, userid).then(() => {
    res.redirect('/ev')
  })
});

router.get('/payment', verifyLogin, async function (req, res, next) {
  const data = req.query
  console.log("chubru1", data)
  userid = req.session.user._id
  if (data.category == 'turf') {
    await userHelper.addBookingTurf(data, userid).then(() => {
      res.render('user/payment', { data, user: true })
    })
  } else if (data.category == 'ev'){
    userHelper.addBookingEv(data,userid).then(() => {
      res.render('user/payment', { data, user: true })
    })
  }else if (data.category == 'auditorium'){
    userHelper.addBookingEv(data,userid).then(() => {
      res.render('user/payment', { data, user: true })
    })
  }else {
    await userHelper.addBookingTurf(data, userid).then(() => {
      res.render('user/payment', { data, user: true })
    })
  }
});

router.post('/payment', verifyLogin, async (req, res, next) => {
  try {
      const data = req.query;
      const payData = req.body;
      const userData = req.session.user;

      console.log("Processing Payment:", payData, data);

      // Object to map category to helper function
      const paymentActions = {
          'turf': userHelper.addPaymentDetailsTurf,
          'ev': userHelper.addPaymentDetailsEv,
          'auditorium': hallHelper.addPaymentDetailsHall,
          'pool': poolHelper.addPaymentDetailsPool
      };

      // Select the function based on category (default to `addPaymentDetailsPool`)
      const paymentFunction = paymentActions[data.category] || poolHelper.addPaymentDetailsPool;

      await paymentFunction(payData, userData, data);

      // Redirect based on category
      const redirectRoutes = {
          'turf': '/turf',
          'ev': '/ev',
          'auditorium': '/hall',
          'pool': '/pool'
      };

      res.redirect(redirectRoutes[data.category] || '/');

  } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).send("Payment processing failed. Please try again.");
  }
});


router.get('/profile', verifyLogin, async function (req, res, next) {
  let userId = req.session.user._id
  await userHelper.getUserDetails(userId).then((User) => {
    console.log("userData", User)
    res.render('user/profile', { User, user: true });
  })
});

router.post('/profile', verifyLogin, (req, res) => {
  const id = req.session.user._id
  console.log("hello", req.body)
  userHelper.updateUserDetails(id, req.body).then(() => {
    res.redirect('/')
  })
});

router.get('/view-booking', verifyLogin, async function (req, res, next) {
  let User = req.session.user
  await userHelper.getBookings(User._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('user/view-booking', { bookDetails, User, user: true, });
  })
});

router.get('/view-payment', verifyLogin, async function (req, res, next) {
  let userId = req.session.user._id
  console.log(userId)
  await userHelper.getAllPayment(userId).then((payment) => {
    console.log(payment)
    res.render('user/view-payment', { payment, user: true });
  })
});

router.get('/view-feedback/:id', verifyLogin, async function (req, res, next) {
  let managerId = req.params.id
  await userHelper.getFeedback(managerId).then((feedbacks) => {
    res.render('user/view-feedback', { feedbacks,managerId, user: true });
  })
});

router.get('/view-feedback-ev/:id', verifyLogin, async function (req, res, next) {
  let managerId = req.params.id
  await userHelper.getEvFeedback(managerId).then((feedbacks) => {
    res.render('user/view-ev-feedback', { feedbacks, user: true });
  })
});

router.get('/cancel-payment', verifyLogin, async (req, res) => {
  let data = req.query
  let slotId = data.slotid
  // Perform the logic for accepting the user (e.g., updating database)
  userHelper.cancelPayment(slotId).then((result) => {
    console.log(result)
    if (data.category == "ev") {
      res.redirect('/ev')
    } else {
      res.redirect('/turf')
    }
  })
});

router.post('/cancel-payment', verifyLogin, () => {
});

router.get('/view-slot-pool/:id', verifyLogin, async function (req, res, next) {
  let slotId = req.params.id
  let poolSlot = await turfHelpers.getSlots(slotId);
  console.log("poopy",poolSlot)
  res.render("user/view-slot-pool", { poolSlot, user: true })
});

router.get('/view-offer-pool/:id', verifyLogin, async function (req, res, next) {
  let offerId = req.params.id
  let poolOffer = await turfHelpers.getOffer(offerId);
  res.render("user/view-offer-pool", { poolOffer, user: true })
});

router.get('/view-pool-feedback/:id', verifyLogin, async function (req, res, next) {
  let managerId = req.params.id
  await poolHelper.getFeedback(managerId).then((feedbacks) => {
    res.render('user/view-pool-feedback', { feedbacks,managerId, user: true });
  })
});

router.get('/feedback-pool/:id', verifyLogin, function (req, res, next) {
  managerId = req.params.id
  res.render('user/feedback-pool', { managerId, user: true });
});

router.post('/feedback-pool/:id', verifyLogin, function (req, res) {
  const feedback = req.body;
  const userId = req.session.user._id;
  const managerId = req.params.id

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  poolHelper.addFeedbackPool(feedback, managerId, userId)
    .then(() => {
      res.redirect('/pool');
    })
    .catch((err) => {
      console.error('Error adding pool:', err);
      res.status(500).send('Failed to add pool');
    });
});

router.get('/view-hall-feedback/:id', verifyLogin, async function (req, res, next) {
  let managerId = req.params.id
  await hallHelper.getAllFeedbacks(managerId).then((feedbacks) => {
    console.log("hellow",feedbacks)
    res.render('user/view-hall-feedback', { feedbacks,managerId, user: true });
  })
});

router.get('/feedback-hall/:id', verifyLogin, function (req, res, next) {
  managerId = req.params.id
  res.render('user/feedback-hall', { managerId, user: true });
});

router.post('/feedback-hall/:id', verifyLogin, function (req, res) {
  const feedback = req.body;
  const userId = req.session.user._id;
  const managerId = req.params.id

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  hallHelper.addFeedbackHall(feedback, managerId, userId)
    .then(() => {
      res.redirect('/hall');
    })
    .catch((err) => {
      console.error('Error adding pool:', err);
      res.status(500).send('Failed to add pool');
    });
});



module.exports = router;
