const { getDB } = require('../config/connection');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const saltRounds = 10;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',  // Replace with your email
        pass: 'your-email-password'   // Use App Password for security
    }
});

// Function to send an email notification
const sendEmailNotification = async (managerEmail, bookingDetails) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        replyTo: bookingDetails.userEmail,
        to: managerEmail,
        subject: 'New Booking Notification',
        text: `Hello Manager,
        
A new booking has been made. Here are the details:

- Category: ${bookingDetails.category}
- Turf Name: ${bookingDetails.turfName || 'N/A'}
- Booking Time: ${bookingDetails.time}
- Amount: ${bookingDetails.amount}
- User Email: ${bookingDetails.userEmail}
- User Phone: ${bookingDetails.userno}

Please check your dashboard for more details.

Best regards,
Booking System`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to manager: ${managerEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Generalized function for payment details and email notification
const addPaymentDetails = async (payData, userData, data, category) => {
    try {
        const db = getDB();
        const collection = db.collection('payment');

        // Construct payment object
        const paymentDetails = {
            ...payData,
            category,
            slotid: data.id,
            managerid: data.managerid,
            amount: data.amount,
            userid: userData._id,
            userEmail: userData.Email,
            userno: userData.phone,
            time: data.time,
            turfName: data.turf  // Ensure turf name is included
        };

        const result = await collection.insertOne(paymentDetails);
        console.log(`Payment added successfully for category: ${category}`);

        // Fetch Manager's Email from DB (assuming a `users` collection stores managers)
        const manager = await db.collection('users').findOne({ _id: data.managerid });
        if (manager && manager.email) {
            await sendEmailNotification(manager.email, paymentDetails);
        } else {
            console.warn("Manager email not found, email notification skipped.");
        }

        return result;
    } catch (err) {
        console.error(`Error processing payment for category ${category}:`, err);
        throw err;
    }
};

// Export individual category-specific functions
const addPaymentDetailsTurf = async (payData, userData, data) => addPaymentDetails(payData, userData, data, 'turf');
const addPaymentDetailsEv = async (payData, userData, data) => addPaymentDetails(payData, userData, data, 'ev');


const getBookingById = async (bookingId) => {
    const db = getDB();
    return await db.collection('bookings').findOne({ _id: bookingId });
};

// Update booking status
const updateBookingStatus = async (bookingId, status) => {
    const db = getDB();
    return await db.collection('slot_booking').updateOne({ _id: new ObjectId(bookingId)}, { $set: { book: status } });
};

// Delete booking
const deleteBooking = async (bookingId) => {
    const db = getDB();
    return await db.collection('slot_booking').deleteOne({ _id: new ObjectId(bookingId)});
};


module.exports = {
    findUserByEmail: async (email) => {
        const db = getDB();
        return db.collection('user').findOne({ Email: email.toLowerCase() });
      },
    
      saveResetToken: async (userId, token, expires) => {
        const db = getDB();
        return db.collection('user').updateOne(
          { _id: userId },
          { $set: { resetPasswordToken: token, resetPasswordExpires: expires } }
        );
      },
    
      findUserByToken: async (token) => {
        const db = getDB();
        return db.collection('user').findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });
      },
    
      updatePassword: async (userId, hashedPassword) => {
        const db = getDB();
        return db.collection('user').updateOne(
          { _id: userId },
          { $set: { password: hashedPassword }, $unset: { resetPasswordToken: "", resetPasswordExpires: "" } }
        );
      },

    doSignup: async (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                userData.password = await bcrypt.hash(userData.password, saltRounds)
                userData.Approval = false;
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('user'); // Replace 'products' with your collection name
                const result = collection.insertOne(userData);
                console.log('user added successfully');
                response.user = userData
                response.result = result
                resolve(response)
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve(err)
            }
        }
        )
    },
    doLogin: (loginData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('user'); // Replace 'user' with your collection name

                let response = {}

                // Find the user by email
                const user = await collection.findOne({ Email: loginData.Email });

                if (!user) {
                    console.log('User not found');
                    resolve(null, 'User not found');

                }

                // Compare the provided password with the hashed password
                const isPasswordMatch = await bcrypt.compare(loginData.password, user.password);

                if (isPasswordMatch) {
                    console.log('Login successful');
                    response.user = user
                    response.status = true
                    resolve(response)
                } else {
                    console.log('Incorrect password');
                    resolve({ status: false })
                }
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve({ status: false })
            }
        }
        )
    },
    addFeedbackTurf: (feedback, managerId, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('feedback'); // Use the 'turf' collection

                feedback.managerid = managerId
                feedback.userid = userId
                feedback.category = 'turf'

                // Insert the turf object
                collection.insertOne(feedback)
                    .then(() => {
                        console.log('feedback added successfully');
                        resolve(feedback._id); // Resolve with the inserted ID
                    })
                    .catch((err) => {
                        console.error('Error inserting turf:', err);
                        reject(err); // Reject with the error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject if an unexpected error occurs
            }
        });
    },
    addFeedbackEv: (feedback, userId, managerId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB();

                const collection = db.collection('feedback'); // Use the 'turf' collection

                feedback.managerid = managerId
                feedback.userid = userId
                feedback.category = 'ev'

                // Insert the turf object
                collection.insertOne(feedback)
                    .then(() => {
                        console.log('feedback added successfully', feedback);
                        resolve(feedback._id); // Resolve with the inserted ID
                    })
                    .catch((err) => {
                        console.error('Error inserting turf:', err);
                        reject(err); // Reject with the error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject if an unexpected error occurs
            }
        });
    },
    addBookingTurf: async (bookingData, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('slot_booking');
                bookingData.book = false
                bookingData.userid = userId
                const result = collection.insertOne(bookingData);
                resolve(bookingData)
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve(err)
            }
        }
        )
    },
    getBookDetails: (Id) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot_booking'); // Use the 'products' collection

                // Fetch a product using `findOne`
                 collection.findOne({ _id:new ObjectId(Id)})
                    .then((Book) => {
                        resolve(Book); // Resolve with the product details
                    })
                    .catch((err) => {
                        console.error('Error fetching product:', err);
                        reject(err); // Reject on MongoDB error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject on unexpected error
            }
        });
    },
    addBookingEv: async (data,userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(data)
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('slot_booking');
                data.book = false
                data.userid = userId
                const result = collection.insertOne(data);
                console.log('user added successfully');
                resolve(result)
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve(err)
            }
        }
        )
    },
    cancelPayment: async (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('products');

                const result = await collection.deleteOne({ _id: new ObjectId(productId) }); // Filter by product's ObjectId

                if (result.deletedCount === 0) {
                    reject('Product not found or already deleted'); // If no document was deleted
                } else {
                    resolve(result); // Return the result of the delete operation
                }

            } catch (err) {
                console.error('Error deleting product:', err); // Correct error message
                reject(err); // Propagate error for further handling
            }
        });
    },
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('user'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(userId) })
                    .then((user) => {
                        resolve(user); // Resolve with the product details
                    })
                    .catch((err) => {
                        console.error('Error fetching product:', err);
                        reject(err); // Reject on MongoDB error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject on unexpected error
            }
        });
    },
    updateUserDetails: async (userId, userDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('user');
                userDetails.password = await bcrypt.hash(userDetails.password, saltRounds)
                const result = await collection.updateOne(
                    { _id: new ObjectId(userId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            name: userDetails.name,
                            Email: userDetails.email,
                            phone: userDetails.phone,
                            place: userDetails.place,
                            district: userDetails.district,
                            country: userDetails.country,
                            password: userDetails.password,
                        },
                    }
                ).then(() => {
                    resolve()
                })
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getBookings: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("userid=", userId)
                const db = getDB();
                const collection = db.collection('slot_booking');
                const result = await collection.find({ userid: userId, book: true }).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getAllPayment: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('payment');
                const result = await collection.find({userid: userId}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getFeedback: async (managerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('feedback');
                const result = await collection.find({managerid: managerId , category: "turf"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getEvFeedback: async (managerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('feedback');
                const result = await collection.find({managerid: managerId , category: "ev"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    cancelPayment: async (slotId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot_booking');

                const result = await collection.deleteOne({ id:slotId }); // Filter by product's ObjectId

                if (result.deletedCount === 0) {
                    reject('user not found or already deleted'); // If no document was deleted
                } else {
                    resolve(result); // Return the result of the delete operation
                }

            } catch (err) {
                console.error('Error deleting user:', err); // Correct error message
                reject(err); // Propagate error for further handling
            }
        });
    },
    addPaymentDetailsTurf,
    addPaymentDetailsEv,
    getBookingById,
    updateBookingStatus,
    deleteBooking, 
    
};

