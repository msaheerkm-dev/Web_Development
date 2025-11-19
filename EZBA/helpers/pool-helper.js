const { response } = require('express');
const { getDB } = require('../config/connection');
const { ObjectId } = require('mongodb');



module.exports = {
    addPool: (pool, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                pool.userid = userId // Attach userId to turf object

                const collection = db.collection('pool'); // Use the 'turf' collection

                // Insert the turf object
                collection.insertOne(pool)
                    .then(() => {
                        console.log('pool added successfully');
                        resolve(pool._id); // Resolve with the inserted ID
                    })
                    .catch((err) => {
                        console.error('Error inserting pool:', err);
                        reject(err); // Reject with the error
                    });
            } catch (err) {
                console.error('Unexpected error:', err);
                reject(err); // Reject if an unexpected error occurs
            }
        });
    },
    addPoolSlot: (slot, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('slot'); // Use the 'turf' collection

                slot.category = 'pool'
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
    addPoolOffer: (offer, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('offer'); // Use the 'turf' collection

                offer.category = 'pool'
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
    getPoolDetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('pool'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ userid: userId })
                    .then((pool) => {
                        resolve(pool); // Resolve with the product details
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
    updatePool: async (poolId, poolDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('pool');

                const result = await collection.updateOne(
                    { _id: new ObjectId(poolId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            name: poolDetails.name,
                            place: poolDetails.place,
                            district: poolDetails.district,
                            amount: poolDetails.amount,
                            phone: poolDetails.phone,
                            location: poolDetails.location,
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
    getPoolSlot: (slotId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(slotId) })
                    .then((poolSlot) => {
                        resolve(poolSlot); // Resolve with the product details
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
    updatePoolSlot: async (slotId, slotDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot');

                const result = await collection.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            time: slotDetails.time,
                            amount:slotDetails.amount,
                            name: slotDetails.name,
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
    getAllPoolSlots: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('slot'); // Replace 'products' with your collection name
            const slots = await collection.find({ category: "pool" }).toArray(); // Retrieve all documents from the collection
            console.log('slots retrieved successfully');
            callback(slots);
        } catch (err) {
            console.error('Error retrieving slots:', err);
        }
    },
    updatePoolOffer: async (offerId, offerDetails) => {
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
    getAllPool: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('pool'); // Replace 'products' with your collection name
            const pools = await collection.find().toArray(); // Retrieve all documents from the collection
            callback(pools);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
    getFeedback: async (managerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('feedback');
                const result = await collection.find({managerid: managerId , category: "pool"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    addFeedbackPool: (feedback, managerId, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('feedback'); // Use the 'turf' collection

                feedback.managerid = managerId
                feedback.userid = userId
                feedback.category = 'pool'

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
    addPaymentDetailsPool: async (payData, userData, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('payment');
                payData.category = 'pool'
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
    getAllFeedbacks: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('feedback');
                const result = await collection.find({managerid: userId , category: "pool"}).toArray()
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
                const result = await collection.find({managerid: userId , category: "pool"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getPoolBooking: (slotId) => {
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
