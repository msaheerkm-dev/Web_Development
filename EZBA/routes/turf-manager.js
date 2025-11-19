var express = require('express');
const turfHelpers = require('../helpers/turf-helpers');
const userHelper = require('../helpers/user-helper');
const evHelper = require('../helpers/ev-helper');
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
  turfHelpers.getAllTurf((turfs) => {
    res.render('turf-manager/home', { turfs, turfmanager: true });
  })
});

router.get('/add-turf', verifyLogin, function (req, res, next) {
  let userId = req.session.user._id
  const turf = req.body;
  res.render('turf-manager/add-turf', { userId, turf, turfmanager: true });
});

router.post('/add-turf', verifyLogin, function (req, res) {
  const turf = req.body;
  const userId = req.session.user._id;

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  turfHelpers.addTurf(turf, userId)
    .then((id) => {
      let image = req.files.Image
      image.mv('./public/turf-images/' + id + '.jpg', (err, done) => {
        if (!err) {
          res.render("admin/add-form", { admin: true })
        }
      })
      res.redirect('/turfmanager');
    })
    .catch((err) => {
      console.error('Error adding turf:', err);
      res.status(500).send('Failed to add turf');
    });
});

router.get('/home', verifyLogin,  function (req, res) {
  res.redirect('/turfmanager')
});

router.get('/edit-turf', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let turf = await turfHelpers.getTurfDetails(userId);
  res.render("turf-manager/edit-turf", { turf, turfmanager: true })
});

router.post('/edit-turf/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  turfHelpers.updateTurf(req.params.id, req.body).then(() => {
    res.redirect('/turfmanager')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/turf-images/' + id + '.jpg')
    }
  })
});

router.get('/turf-slot', verifyLogin, function (req, res, next) {
  const slot = req.body;
  res.render('turf-manager/turf-slot', {  slot, turfmanager: true });
});

router.post('/turf-slot', verifyLogin, function (req, res) {
  const slot = req.body;
  const userId=req.session.user._id

  if (!slot) {
    return res.status(401).send('Unauthorized: No user ID found');
  }
  turfHelpers.addTurfSlot(slot,userId)
    .then(() => {
      res.redirect('/turfmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/turf-offer', verifyLogin, function (req, res, next) {
  
  res.render('turf-manager/turf-offer', {   turfmanager: true });
});

router.post('/turf-offer', verifyLogin, function (req, res) {
  const offer = req.body;
  const userId=req.session.user._id

  turfHelpers.addTurfOffer(offer,userId)
    .then(() => {
      res.redirect('/turfmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/edit-turf-offer', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let turfOffer = await turfHelpers.getTurfOffer(userId);
  res.render("turf-manager/edit-turf-offer", { turfOffer, turfmanager: true })
});

router.post('/edit-turf-offer/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  turfHelpers.updateTurfOffer(id, req.body).then(() => {
    res.redirect('/turfmanager')
  })
});

router.get('/edit-turf-slot/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let turfSlot = await turfHelpers.getTurfSlot(slotId);
  res.render("turf-manager/edit-turf-slot", { turfSlot, turfmanager: true })
});

router.post('/edit-turf-slot/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  turfHelpers.updateTurfSlot(id, req.body).then(() => {
    res.redirect('/turfmanager')
  })
});

router.get('/view-turf-slot', verifyLogin, function (req, res, next) {
  let turfManager = req.session.user
  turfHelpers.getAllTurfSlots((slots) => {
    res.render('turf-manager/view-turf-slot', { slots, turfManager,turfmanager: true });
  })
});

router.get('/bookings', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await evHelper.getBookingDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('turf-manager/bookings', { bookDetails, user, turfmanager: true });
  })
});

router.post('/accept-user-booking/:id', verifyLogin, () => {
});

router.get('/view-turf-booking', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await turfHelpers.getBookedDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('turf-manager/view-booking', { bookDetails, user, turfmanager: true });
  })
});

router.get('/view-turf-feedback', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await turfHelpers.getAllFeedbacks(userId).then((feedbacks)  => {
      res.render('turf-manager/view-feedback', { feedbacks, turfmanager: true });
  })
});

router.get('/view-turf-payment', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  console.log(userId)
  await turfHelpers.getPaymentDetails(userId).then((payment)  => {
    console.log(payment)
      res.render('turf-manager/view-payment', { payment, turfmanager: true });
  })
});

router.get('/turfmanager-profile', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await userHelper.getUserDetails(userId).then((user)  => {
    console.log("userData",user)
      res.render('turf-manager/profile', { user, turfmanager: true });
  })
});

router.post('/turfmanager-profile', verifyLogin,  (req, res) => {
  const id=req.session.user._id
  console.log("hello",req.body)
  userHelper.updateUserDetails(id, req.body).then(() => {
    res.redirect('/turfmanager')
  })
});

router.get('/delete-turf-slot/:id', verifyLogin, async (req, res) => {
  let slotId = req.params.id;
  turfHelpers.deleteSlot(slotId).then((result) => {
    console.log(result)
    res.redirect('/turfmanager/view-turf-slot')
  })
});

router.post('/delete-turf-slot/:id', verifyLogin, () => {
});

router.get('/search-turf', verifyLogin, function (req, res, next) {
  res.render('/turfmanager/search-turf', { user: true });
});

router.get('/view-slot-booking', verifyLogin, async function (req, res, next) {
  let userId= req.session.user._id
  let turfBooking = await turfHelpers.getBooking(userId);
  console.log("shabir",turfBooking)
  res.render("turf-manager/view-turf-booking", { turfBooking, turfmanager: true})
});

router.get('/edit-turf-Booking/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let slotBooking = await turfHelpers.getTurfBooking(slotId);
  res.render("turf-manager/edit-booking", { slotBooking, turfmanager: true })
});

router.post('/edit-turf-booking/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  turfHelpers.updateTurfBooking(id, req.body).then(() => {
    res.redirect('/turfmanager')
  })
});

// ✅ Accept Booking Route
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

      res.redirect('/turfmanager/bookings'); // Redirect to bookings page
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

      res.redirect('/turfmanager/bookings'); // Redirect back to booking page
  } catch (error) {
      console.error('Error rejecting booking:', error);
      res.status(500).send('Error rejecting booking.');
  }
});

router.get('/delete-turf-booking/:id', verifyLogin, async (req, res) => {
  let Id = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  turfmanager.deleteBookedSlot(Id).then((result) => {
    console.log(result)
    res.redirect('/turfmanager/view-slot-booking')
  })
});

router.post('/delete-turf-booking/:id', verifyLogin, () => {
});


module.exports = router;