const { response } = require('express');
const { getDB } = require('../config/connection');
const { ObjectId } = require('mongodb');



module.exports = {
    addTurf: (turf, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                turf.userid = userId // Attach userId to turf object

                const collection = db.collection('turf'); // Use the 'turf' collection

                // Insert the turf object
                collection.insertOne(turf)
                    .then(() => {
                        console.log('Turf added successfully');
                        resolve(turf._id); // Resolve with the inserted ID
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
    getAllTurf: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('turf'); // Replace 'products' with your collection name
            const turfs = await collection.find().toArray(); // Retrieve all documents from the collection
            console.log('Products retrieved successfully');
            callback(turfs);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
    getTurfDetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('turf'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ userid: userId })
                    .then((turf) => {
                        resolve(turf); // Resolve with the product details
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
    updateTurf: async (turfId, turfDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('turf');

                const result = await collection.updateOne(
                    { _id: new ObjectId(turfId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            name: turfDetails.name,
                            place: turfDetails.place,
                            district: turfDetails.district,
                            amount: turfDetails.amount,
                            phone: turfDetails.phone,
                            location: turfDetails.location,
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
    addTurfOffer: (offer, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('offer'); // Use the 'turf' collection

                offer.category = 'turf'
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
    updateTurfOffer: async (offerId, offerDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('offer');

                const result = await collection.updateOne(
                    { _id: new ObjectId(offerId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            date: offerDetails.date,
                            turf: offerDetails.turf,
                            amount: offerDetails.amount,
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
    addTurfSlot: (slot, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('slot'); // Use the 'turf' collection

                slot.category = 'turf'
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
    getTurfSlot: (slotId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(slotId) })
                    .then((turfSlot) => {
                        resolve(turfSlot); // Resolve with the product details
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
    getAllTurfSlots: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('slot'); // Replace 'products' with your collection name
            const slots = await collection.find({ category: "turf" }).toArray(); // Retrieve all documents from the collection
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
    updateTurfSlot: async (slotId, slotDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot');

                const result = await collection.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            time: slotDetails.time,
                            turf: slotDetails.turf,
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
                const result = await collection.find({managerid: userId , category: "turf"}).toArray()
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
                const result = await collection.find({managerid: userId , category: "turf"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    deleteSlot: async (slotId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot');

                const result = await collection.deleteOne({ _id: new ObjectId(slotId) }); // Filter by product's ObjectId

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
    getBooking: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot_booking'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.find({ managerid: userId}).toArray()
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
    getTurfBooking: (slotId) => {
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
    deleteBookedSlot: async (Id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot_booking');

                const result = await collection.deleteOne({ _id: new ObjectId(Id) }); // Filter by product's ObjectId

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
    updateTurfBooking: async (slotId, slotDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot_booking');

                const result = await collection.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            time: slotDetails.time,
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

};
