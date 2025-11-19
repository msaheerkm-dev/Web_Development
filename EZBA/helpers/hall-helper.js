const { response } = require('express');
const { getDB } = require('../config/connection');
const { ObjectId } = require('mongodb');



module.exports = {
    addHall: (hall, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                hall.userid = userId // Attach userId to turf object

                const collection = db.collection('auditorium'); // Use the 'turf' collection

                // Insert the turf object
                collection.insertOne(hall)
                    .then(() => {
                        console.log('hall added successfully');
                        resolve(hall._id); // Resolve with the inserted ID
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
    getAllHall: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('auditorium'); // Replace 'products' with your collection name
            const halls = await collection.find().toArray(); // Retrieve all documents from the collection
            console.log('Products retrieved successfully');
            callback(halls);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
    getHallDetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('auditorium'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ userid: userId })
                    .then((hall) => {
                        resolve(hall); // Resolve with the product details
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
    updateHall: async (hallId, hallDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('auditorium');

                const result = await collection.updateOne(
                    { _id: new ObjectId(hallId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            name: hallDetails.name,
                            place: hallDetails.place,
                            district: hallDetails.district,
                            amount: hallDetails.amount,
                            phone: hallDetails.phone,
                            location: hallDetails.location,
                        },
                    }
                ).then((response) => {
                    resolve()
                })
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    addHallOffer: (offer, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('offer'); // Use the 'turf' collection

                offer.category = 'auditorium'
                offer.userid = userId

                // Insert the turf object
                collection.insertOne(offer)
                    .then(() => {
                        console.log('offer added successfully');
                        resolve(offer._id); // Resolve with the inserted ID
                    })
                    .catch((err) => {
                        console.error('Error inserting offer:', err);
                        reject(err); // Reject with the error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject if an unexpected error occurs
            }
        });
    },
    getTurfOffer: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('offer'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ userid: userId })
                    .then((turfOffer) => {
                        resolve(turfOffer); // Resolve with the product details
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
    updateHallOffer: async (offerId, offerDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('offer');

                const result = await collection.updateOne(
                    { _id: new ObjectId(offerId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            date: offerDetails.date,
                            name: offerDetails.name,
                            discount: offerDetails.discount,
                        },
                    }
                ).then((response) => {
                    resolve()
                })
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    addHallSlot: (slot, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('slot'); // Use the 'turf' collection

                slot.category = 'auditorium'
                slot.availability=true
                slot.userid = userId

                // Insert the turf object
                collection.insertOne(slot)
                    .then(() => {
                        console.log('slot added successfully');
                        resolve(slot._id); // Resolve with the inserted ID
                    })
                    .catch((err) => {
                        console.error('Error inserting slot:', err);
                        reject(err); // Reject with the error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject if an unexpected error occurs
            }
        });
    },
    getAllHallSlots: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('slot'); // Replace 'products' with your collection name
            const slots = await collection.find({ category: "auditorium" }).toArray(); // Retrieve all documents from the collection
            console.log('slots retrieved successfully');
            callback(slots);
        } catch (err) {
            console.error('Error retrieving slots:', err);
        }
    },
    getSlots: (slotId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.find({ userid: slotId , availability:true}).toArray()
                    .then((result) => {
                        resolve(result); // Resolve with the product details
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
    updatehallSlot: async (slotId, slotDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot');

                const result = await collection.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            hours: slotDetails.hours,
                            time: slotDetails.time,
                            name: slotDetails.name,
                            amount: slotDetails.amount,
                        },
                    }
                ).then((response) => {
                    resolve()
                })
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getOffer: (offerId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('offer'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.find({ userid: offerId }).toArray()
                    .then((result) => {
                        resolve(result); // Resolve with the product details
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
    getBookedDetails: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("userid=", userId)
                const db = getDB();
                const collection = db.collection('slot_booking');
                const result = await collection.find({ managerid: userId, book: true }).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getAllFeedbacks: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('feedback');
                const result = await collection.find({managerid: userId , category: "auditorium"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getPaymentDetails: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('payment');
                const result = await collection.find({managerid: userId , category: "auditorium"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    addPaymentDetailsHall: async (payData, userData, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('payment');
                payData.category = 'auditorium'
                payData.slotid = data.id
                payData.managerid = data.managerid
                payData.amount = data.amount
                payData.userid = userData._id
                payData.userEmail = userData.Email
                payData.userno = userData.phone
                const result = collection.insertOne(payData);
                console.log('payment added successfully');
                resolve(result)
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve(err)
            }
        }
        )
    },
    addFeedbackHall: (feedback, managerId, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('feedback'); // Use the 'turf' collection

                feedback.managerid = managerId
                feedback.userid = userId
                feedback.category = 'auditorium'

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
    getHallBooking: (slotId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot_booking'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(slotId) })
                    .then((slotBooking) => {
                        resolve(slotBooking); // Resolve with the product details
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

};
