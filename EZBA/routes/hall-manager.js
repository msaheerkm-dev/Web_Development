var express = require('express');
const turfHelpers = require('../helpers/turf-helpers');
const userHelper = require('../helpers/user-helper');
const evHelper = require('../helpers/ev-helper');
const hallHelper = require('../helpers/hall-helper');
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
    res.render('hall-manager/home', {  hallmanager: true });
});

router.get('/add-hall', verifyLogin, function (req, res, next) {
  let userId = req.session.user._id
  const hall = req.body;
  res.render('hall-manager/add-hall', { userId, hall, hallmanager: true });
});

router.post('/add-hall', verifyLogin, function (req, res) {
  const hall = req.body;
  const userId = req.session.user._id;

  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }

  hallHelper.addHall(hall, userId)
    .then((id) => {
      let image = req.files.Image
      image.mv('./public/hall-images/' + id + '.jpg', (err, done) => {
        if (!err) {
          res.render("hallmanager/add-hall", { hallmanager: true })
        }
      })
      res.redirect('/hallmanager');
    })
    .catch((err) => {
      console.error('Error adding hall:', err);
      res.status(500).send('Failed to add hall');
    });
});

router.get('/edit-hall', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let hall = await hallHelper.getHallDetails(userId);
  res.render("hall-manager/edit-hall", { hall, hallmanager: true })
});

router.post('/edit-hall/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  hallHelper.updateHall(req.params.id, req.body).then(() => {
    res.redirect('/hallmanager')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/hall-images/' + id + '.jpg')
    }
  })
});

router.get('/hall-slot', verifyLogin, function (req, res, next) {
  const slot = req.body;
  res.render('hall-manager/hall-slot', {  slot, hallmanager: true });
});

router.post('/hall-slot', verifyLogin, function (req, res) {
  const slot = req.body;
  const userId=req.session.user._id

  if (!slot) {
    return res.status(401).send('Unauthorized: No user ID found');
  }
  hallHelper.addHallSlot(slot,userId)
    .then(() => {
      res.redirect('/hallmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/hall-offer', verifyLogin, function (req, res, next) {
  
  res.render('hall-manager/hall-offer', {   hallmanager: true });
});

router.post('/hall-offer', verifyLogin, function (req, res) {
  const offer = req.body;
  const userId=req.session.user._id

  hallHelper.addHallOffer(offer,userId)
    .then(() => {
      res.redirect('/hallmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/edit-hall-offer', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let hallOffer = await turfHelpers.getTurfOffer(userId);
  res.render("hall-manager/edit-hall-offer", { hallOffer, hallmanager: true })
});

router.post('/edit-hall-offer/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  hallHelper.updateHallOffer(id, req.body).then(() => {
    res.redirect('/hallmanager')
  })
});

router.get('/edit-hall-slot/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let hallSlot = await turfHelpers.getTurfSlot(slotId);
  res.render("hall-manager/edit-hall-slot", { hallSlot, hallmanager: true })
});

router.post('/edit-hall-slot/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  hallHelper.updatehallSlot(id, req.body).then(() => {
    res.redirect('/hallmanager')
  })
});

router.get('/view-hall-slot', verifyLogin, function (req, res, next) {
  let hallmanager = req.session.user
  hallHelper.getAllHallSlots((slots) => {
    res.render('hall-manager/view-hall-slot', { slots, hallmanager,hallmanager: true });
  })
});

router.get('/bookings', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await evHelper.getBookingDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('hall-manager/bookings', { bookDetails, user, hallmanager: true });
  })
});

router.post('/accept-user-booking/:id', verifyLogin, () => {
});

router.get('/view-hall-booking', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await turfHelpers.getBookedDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('hall-manager/view-booking', { bookDetails, user, hallmanager: true });
  })
});

router.get('/view-hall-feedback', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await hallHelper.getAllFeedbacks(userId).then((feedbacks)  => {
      res.render('hall-manager/view-feedback', { feedbacks, hallmanager: true });
  })
});

router.get('/view-hall-payment', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  console.log(userId)
  await hallHelper.getPaymentDetails(userId).then((payment)  => {
    console.log(payment)
      res.render('hall-manager/view-payment', { payment, hallmanager: true });
  })
});

router.get('/hallmanager-profile', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await userHelper.getUserDetails(userId).then((user)  => {
    console.log("userData",user)
      res.render('hall-manager/profile', { user, hallmanager: true });
  })
});

router.post('/hallmanager-profile', verifyLogin,  (req, res) => {
  const id=req.session.user._id
  console.log("hello",req.body)
  userHelper.updateUserDetails(id, req.body).then(() => {
    res.redirect('/hallmanager')
  })
});

router.get('/delete-hall-slot/:id', verifyLogin, async (req, res) => {
  let slotId = req.params.id;
  turfHelpers.deleteSlot(slotId).then((result) => {
    console.log(result)
    res.redirect('/hallmanager/view-hall-slot')
  })
});

router.post('/delete-hall-slot/:id', verifyLogin, () => {
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

      res.redirect('/hallmanager/bookings'); // Redirect to bookings page
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

      res.redirect('/hallmanager/bookings'); // Redirect back to booking page
  } catch (error) {
      console.error('Error rejecting booking:', error);
      res.status(500).send('Error rejecting booking.');
  }
});

router.get('/hall-view-booking', verifyLogin, async function (req, res, next) {
  let userId= req.session.user._id
  let hallBooking = await turfHelpers.getBooking(userId);
  res.render("hall-manager/view-hall-slot", { hallBooking, hallmanager: true})
});

router.get('/edit-hall-Booking/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let slotBooking = await hallHelper.getHallBooking(slotId);
  res.render("hall-manager/edit-booking", { slotBooking, hallmanager: true })
});

router.post('/edit-hall-booking/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  turfHelpers.updateTurfBooking(id, req.body).then(() => {
    res.redirect('/hallmanager')
  })
});

router.get('/delete-Booking/:id',  verifyLogin, async (req, res) => {
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

module.exports = router;