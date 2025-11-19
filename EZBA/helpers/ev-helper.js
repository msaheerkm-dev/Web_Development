const { response } = require('express');
const { getDB } = require('../config/connection');
const { ObjectId } = require('mongodb');



module.exports = {
    addEvStation: (station, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                station.userid = userId // Attach userId to turf object

                const collection = db.collection('EV'); // Use the 'turf' collection

                // Insert the turf object
                collection.insertOne(station)
                    .then(() => {
                        console.log('Turf added successfully');
                        resolve(station._id); // Resolve with the inserted ID
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
    getAllStation: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('EV'); // Replace 'products' with your collection name
            const stations = await collection.find().toArray(); // Retrieve all documents from the collection
            console.log('Products retrieved successfully');
            callback(stations);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
    addEvSlot: (slot, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('slot'); // Use the 'turf' collection

                slot.category = 'ev'
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
    addEvOffer: (offer, userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance

                const collection = db.collection('offer'); // Use the 'turf' collection

                offer.category = 'ev'
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
    getStationDetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('EV'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ userid: userId })
                    .then((station) => {
                        resolve(station); // Resolve with the product details
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
    updateStation: async (stationId, stationDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('EV');

                const result = await collection.updateOne(
                    { _id: new ObjectId(stationId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            name: stationDetails.name,
                            place: stationDetails.place,
                            district: stationDetails.district,
                            amount: stationDetails.amount,
                            phone: stationDetails.phone,
                            location: stationDetails.location,
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
    getEvSlot: (slotId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(slotId) })
                    .then((evSlot) => {
                        resolve(evSlot); // Resolve with the product details
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
    updateEvSlot: async (slotId, slotDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot');

                const result = await collection.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            time: slotDetails.time,
                            power: slotDetails.power,
                            cost: slotDetails.cost,
                            connector: slotDetails.connector,
                            availability: slotDetails.availability,
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
    getAllEvSlots: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('slot'); // Replace 'products' with your collection name
            const slots = await collection.find({ category: "ev" }).toArray(); // Retrieve all documents from the collection
            console.log('slots retrieved successfully');
            callback(slots);
        } catch (err) {
            console.error('Error retrieving slots:', err);
        }
    },
    getEvOffer: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('offer'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ userid: userId })
                    .then((evOffer) => {
                        resolve(evOffer); // Resolve with the product details
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
    updateEvOffer: async (offerId, offerDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('offer');

                const result = await collection.updateOne(
                    { _id: new ObjectId(offerId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            date: offerDetails.date,
                            station: offerDetails.station,
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
    getSlots: (slotId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('slot'); // Use the 'products' collection
                console.log(slotId)
                // Fetch a product using `findOne`
                collection.find({ userid: slotId,availability:true}).toArray()
                    .then((result) => {
                        console.log(result)
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
    getBookingDetails: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("userid=", userId)
                const db = getDB();
                const collection = db.collection('slot_booking');
                const result = await collection.find({ managerid: userId, book: false }).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    acceptUserBooking: async (slotId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                console.log(slotId)
                const collection = db.collection('slot_booking');
                const result1 = await collection.updateOne(
                    { id: slotId }, // Filter by product's ObjectId
                    {
                        $set: {
                            book: true,
                        },
                    },
                );
                const collection2 = db.collection('slot');
                const result2 = await collection2.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            availability: false,
                        },
                    },
                );
                resolve({result1,result2}) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getFeedbacks: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('feedback');
                const result = await collection.find({managerid: userId , category: "ev"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    getPayment: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('payment');
                const result = await collection.find({managerid: userId , category: "e"}).toArray()
                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    updateEvBooking: async (slotId, slotDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('slot_booking');

                const result = await collection.updateOne(
                    { _id: new ObjectId(slotId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            time: slotDetails.time,
                            extendTime: slotDetails.extend,
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
