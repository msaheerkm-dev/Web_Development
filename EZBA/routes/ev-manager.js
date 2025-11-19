var express = require('express');
const evHelper = require('../helpers/ev-helper');
const userHelper = require('../helpers/user-helper');
const turfHelpers = require('../helpers/turf-helpers');
const nodemailer = require('nodemailer');
const hallHelper = require('../helpers/hall-helper');
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
  res.render('ev-manager/ev-home', { evmanager: true });
});

router.get('/add-station', verifyLogin, function (req, res, next) {
  let userId = req.session.user._id
  const station = req.body;
  res.render('ev-manager/add-station', { userId, station, evmanager: true });
});

router.post('/add-station', verifyLogin, function (req, res) {
  const station = req.body;
  const userId = req.session.user._id;
  if (!userId) {
    return res.status(401).send('Unauthorized: No user ID found');
  }
  evHelper.addEvStation(station, userId)
    .then((id) => {
      let image = req.files.Image
      image.mv('./public/ev-images/' + id + '.jpg', (err, done) => {
        if (!err) {
          res.send(err)
        }
      })
      res.redirect('/evmanager');
    })
    .catch((err) => {
      console.error('Error adding station:', err);
      res.status(500).send('Failed to add station');
    });
});

router.get('/add-slot', verifyLogin, function (req, res, next) {
  const slot = req.body;
  res.render('ev-manager/add-slot', { slot, evmanager: true });
});

router.post('/add-slot', verifyLogin, function (req, res) {
  const slot = req.body;
  const userId = req.session.user._id

  if (!slot) {
    return res.status(401).send('Unauthorized: No user ID found');
  }
  evHelper.addEvSlot(slot, userId)
    .then(() => {
      res.redirect('/evmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/add-offer', verifyLogin, function (req, res, next) {

  res.render('ev-manager/add-offer', { evmanager: true });
});

router.post('/add-offer', verifyLogin, function (req, res) {
  const offer = req.body;
  const userId = req.session.user._id

  evHelper.addEvOffer(offer, userId)
    .then(() => {
      res.redirect('/evmanager');
    })
    .catch((err) => {
      console.error('Error adding slot:', err);
      res.status(500).send('Failed to add slot');
    });
});

router.get('/edit-ev-station', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let station = await evHelper.getStationDetails(userId);
  res.render("ev-manager/edit-ev-station", { station, evmanager: true })
});

router.post('/edit-ev-station/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  evHelper.updateStation(id, req.body).then(() => {
    res.redirect('/evmanager')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/ev-images/' + id + '.jpg')
    }
  })
});

router.get('/edit-ev-slot/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let evSlot = await evHelper.getEvSlot(slotId);
  res.render("ev-manager/edit-ev-slot", { evSlot, evmanager: true })
});

router.post('/edit-ev-slot/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  evHelper.updateEvSlot(id, req.body).then(() => {
    res.redirect('/evmanager')
  })
});

router.get('/edit-ev-offer', verifyLogin, async function (req, res) {
  let userId = req.session.user._id
  let evOffer = await evHelper.getEvOffer(userId);
  res.render("ev-manager/edit-ev-offer", { evOffer, evmanager: true })
});

router.post('/edit-ev-offer/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  evHelper.updateEvOffer(id, req.body).then(() => {
    res.redirect('/evmanager')
  })
});

router.get('/view-slot', verifyLogin, function (req, res, next) {
  let evManager = req.session.user
  evHelper.getAllEvSlots((slots) => {
    res.render('ev-manager/view-slot', { slots, evManager, evmanager: true });
  })
});

router.get('/book-request', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await evHelper.getBookingDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('ev-manager/book-request', { bookDetails, user, evmanager: true });
  })
});

router.get('/accept-user-booking/:id', verifyLogin, async (req, res) => {
  let slotId = req.params.id;
  // Perform the logic for accepting the user (e.g., updating database)
  evHelper.acceptUserBooking(slotId).then((result) => {
    console.log(result)
    res.redirect('/evmanager')
  })
});

router.post('/accept-user-booking/:id', verifyLogin, () => {
});

router.get('/evmanager-profile', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await userHelper.getUserDetails(userId).then((user)  => {
    console.log("userData",user)
      res.render('ev-manager/profile', { user, evmanager: true });
  })
});

router.post('/evmanager-profile', verifyLogin,  (req, res) => {
  const id=req.session.user._id
  console.log("hello",req.body)
  userHelper.updateUserDetails(id, req.body).then(() => {
    res.redirect('/evmanager')
  })
});

router.get('/view-ev-booking', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  await turfHelpers.getBookedDetails(user._id).then((bookDetails) => {
    console.log(bookDetails)
    res.render('ev-manager/view-booking', { bookDetails, user, evmanager: true });
  })
});

router.get('/view-ev-feedback', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  await evHelper.getFeedbacks(userId).then((feedbacks)  => {
      res.render('ev-manager/view-feedback', { feedbacks, evmanager: true });
  })
});

router.get('/view-ev-payment', verifyLogin, async function (req, res, next) {
  let userId=req.session.user._id
  console.log(userId)
  await evHelper.getPayment(userId).then((payment)  => {
    console.log(payment)
      res.render('ev-manager/view-payment', { payment, evmanager: true });
  })
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

      res.redirect('/evmanager/bookings'); // Redirect to bookings page
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

      res.redirect('/evmanager/bookings'); // Redirect back to booking page
  } catch (error) {
      console.error('Error rejecting booking:', error);
      res.status(500).send('Error rejecting booking.');
  }
});

router.get('/view-slot-booking', verifyLogin, async function (req, res, next) {
  let userId= req.session.user._id
  let evBooking = await turfHelpers.getBooking(userId);
  res.render("ev-manager/view-booked-slot", { evBooking, evmanager: true})
});

router.get('/edit-ev-Booking/:id', verifyLogin, async function (req, res) {
  let slotId = req.params.id
  let slotBooking = await hallHelper.getHallBooking(slotId);
  res.render("ev-manager/edit-booking", { slotBooking, evmanager: true })
});

router.post('/edit-ev-booking/:id', verifyLogin,  (req, res) => {
  let id = req.params.id
  console.log(id)
  evHelper.updateEvBooking(id, req.body).then(() => {
    res.redirect('/evmanager')
  })
});

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

      res.redirect('/evmanager/view-booked-slot'); // Redirect back to booking page
  } catch (error) {
      console.error('Error rejecting booking:', error);
      res.status(500).send('Error rejecting booking.');
  }
});

module.exports = router;