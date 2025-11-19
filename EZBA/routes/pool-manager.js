var express = require('express');
const turfHelpers = require('../helpers/turf-helpers');
const userHelper = require('../helpers/user-helper');
const evHelper = require('../helpers/ev-helper');
const poolHelper = require('../helpers/pool-helper');
const nodemailer = require('nodemailer');
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'your-email@gmail.com', // Replace with your email
      pass: 'your-email-password'   // Use an App Password instead of raw password
  }
});

// Function to send email notifications
const sendEmailNotification = async (userEmail, subject, message) => {
  const mailOptions = {
      from: 'your-email@gmail.com', // System email
      to: userEmail,
      subject: subject,
      text: message
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to user: ${userEmail}`);
  } catch (error) {
      console.error('Error sending email:', error);
  }
};

router.get('/', verifyLogin, function (req, res, next) {
    res.render('pool-manager/home', { poolmanager: true });
});

router.get('/add-pool', verifyLogin, function (req, res, next) {
  let userId = req.session.user._id
  const pool = req.body;
  res.render('pool-manager/add-pool', { userId, pool, poolmanager: true });
});

router.post('/add-pool', verifyLogin, function (req, res) {
  const pool = req.body;
  const userId = req.session.user._id;

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  poolHelper.addPool(pool, userId)
    .then((id) => {
      let image = req.files.Image
      image.mv('./public/pool-images/' + id + '.jpg', (err, done) => {
        if (!err) {
          res.render("poolmanager/add-pool", { poolmanager: true })
        }
      })
      res.redirect('/poolmanager');
    })
    .catch((err) => {
      console.error('Error adding pool:', err);
      res.status(500).send('Failed to add pool');
    });
});

router.get('/home', verifyLogin,  function (req, res) {
  res.redirect('/poolmanger')
});

router.get('/edit-pool', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let pool = await poolHelper.getPoolDetails(userId);
  res.render("pool-manager/edit-pool", { pool, poolmanager: true })
});

router.post('/edit-pool/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  poolHelper.updatePool(req.params.id, req.body).then(() => {
    res.redirect('/poolmanager')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/pool-images/' + id + '.jpg')
    }
  })
});

router.get('/pool-slot', verifyLogin, function (req, res, next) {
  const slot = req.body;
  res.render('pool-manager/pool-slot', {  slot, poolmanager: true });
});

router.post('/pool-slot', verifyLogin, function (req, res) {
  const slot = req.body;
  const userId=req.session.user._id

  if (!slot) {
    return res.status(401).send('Unauthorized: No user ID found');
  }
  poolHelper.addPoolSlot(slot,userId)
    .then(() => {
      res.redirect('/poolmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/pool-offer', verifyLogin, function (req, res, next) {
  
  res.render('pool-manager/pool-offer', {   poolmanager: true });
});

router.post('/pool-offer', verifyLogin, function (req, res) {
  const offer = req.body;
  const userId=req.session.user._id

  poolHelper.addPoolOffer(offer,userId)
    .then(() => {
      res.redirect('/poolmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/edit-pool-offer', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let poolOffer = await turfHelpers.getTurfOffer(userId);
  res.render("pool-manager/edit-pool-offer", { poolOffer, poolmanager: true })
});

router.post('/edit-pool-offer/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  poolHelper.updatePoolOffer(id, req.body).then(() => {
    res.redirect('/poolmanager')
  })
});

router.get('/edit-pool-slot/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let poolSlot = await poolHelper.getPoolSlot(slotId);
  console.log('hellow',poolSlot)
  res.render("pool-manager/edit-pool-slot", { poolSlot, poolmanager: true })
});

router.post('/edit-pool-slot/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  poolHelper.updatePoolSlot(id, req.body).then(() => {
    res.redirect('/poolmanager')
  })
});

router.get('/view-pool-slot', verifyLogin, function (req, res, next) {
  let poolmanager = req.session.user
  poolHelper.getAllPoolSlots((slots) => {
    res.render('pool-manager/view-pool-slot', { slots, poolmanager,poolmanagr: true });
  })
});

router.get('/bookings', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await evHelper.getBookingDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('pool-manager/bookings', { bookDetails, user, poolmanager: true });
  })
});

router.post('/accept-user-booking/:id', verifyLogin, () => {
});

router.get('/view-pool-booking', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await turfHelpers.getBookedDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('pool-manager/view-booking', { bookDetails, user, poolmanager: true });
  })
});

router.get('/view-pool-feedback', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await poolHelper.getAllFeedbacks(userId).then((feedbacks)  => {
      res.render('pool-manager/view-feedback', { feedbacks, poolmanager: true });
  })
});

router.get('/view-pool-payment', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  console.log(userId)
  await poolHelper.getPaymentDetails(userId).then((payment)  => {
    console.log(payment)
      res.render('pool-manager/view-payment', { payment, poolmanager: true });
  })
});

router.get('/poolmanager-profile', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await userHelper.getUserDetails(userId).then((user)  => {
    console.log("userData",user)
      res.render('pool-manager/profile', { user, poolmanager: true });
  })
});

router.post('/poolmanager-profile', verifyLogin,  (req, res) => {
  const id=req.session.user._id
  console.log("hello",req.body)
  userHelper.updateUserDetails(id, req.body).then(() => {
    res.redirect('/poolmanager')
  })
});

router.get('/delete-pool-slot/:id', verifyLogin, async (req, res) => {
  let slotId = req.params.id;
  turfHelpers.deleteSlot(slotId).then((result) => {
    res.redirect('/poolmanager/view-pool-slot')
  })
});

router.post('/delete-pool-slot/:id', verifyLogin, () => {
});

router.get('/accept-user-booking/:id',  verifyLogin, async (req, res) => {
  try {
      const bookingId = req.params.id;
      const booking = await userHelper.getBookingById(bookingId);

      if (!booking) {
          return res.status(404).send('Booking not found');
      }

      // Update booking status in DB
      await userHelper.updateBookingStatus(bookingId, 'Accepted');

      // Send an email notification to the user
      await sendEmailNotification(
          booking.userEmail,
          'Booking Accepted',
          `Hello, your booking for ${booking.category} at ${booking.time} has been accepted!`
      );

      res.redirect('/poolmanager/bookings'); // Redirect to bookings page
  } catch (error) {
      console.error('Error accepting booking:', error);
      res.status(500).send('Error accepting booking.');
  }
});

// ❌ Reject Booking Route
router.get('/delete-user/:id',  verifyLogin, async (req, res) => {
  try {
      const bookingId = req.params.id;
      const booking = await userHelper.getBookingById(bookingId);

      if (!booking) {
          return res.status(404).send('Booking not found');
      }

      // Delete the booking from DB
      await userHelper.deleteBooking(bookingId);

      // Send an email notification to the user
      await sendEmailNotification(
          booking.userEmail,
          'Booking Rejected',
          `Hello, your booking for ${booking.category} at ${booking.time} has been rejected.`
      );

      res.redirect('/poolmanager/bookings'); // Redirect back to booking page
  } catch (error) {
      console.error('Error rejecting booking:', error);
      res.status(500).send('Error rejecting booking.');
  }
});

router.get('/pool-view-booking', verifyLogin, async function (req, res, next) {
  let userId= req.session.user._id
  let poolBooking = await turfHelpers.getBooking(userId);
  res.render("pool-manager/view-pool-booking", { poolBooking, poolmanager: true})
});


router.get('/delete-pool-booking/:id', verifyLogin, async (req, res) => {
  let Id = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  turfmanager.deleteBookedSlot(Id).then((result) => {
    console.log(result)
    res.redirect('/poolmanager/slot-view-booking')
  })
});

router.post('/delete-turf-booking/:id', verifyLogin, () => {
});

router.get('/edit-pool-Booking/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let slotBooking = await poolHelper.getPoolBooking(slotId);
  res.render("pool-manager/edit-booking", { slotBooking, poolmanager: true })
});

router.post('/edit-pool-booking/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  turfHelpers.updateTurfBooking(id, req.body).then(() => {
    res.redirect('/poolmanager')
  })
});

module.exports = router;