const { getDB } = require('../config/connection');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt')
const saltRounds = 10;


module.exports = {
    
    doSignupAdmin: async (adminData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                console.log(adminData)
                adminData.password = await bcrypt.hash(adminData.password, saltRounds)
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('user'); // Replace 'products' with your collection name
                adminData.role = 'admin'
                const result = collection.insertOne(adminData);
                console.log('user added successfully');
                response.admin = adminData
                response.result = result
                resolve(response)
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve(err)
            }
        }
        )
    },
    doLoginAdmin: (loginData) => {
        console.log(loginData)
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB(); // Use the `getDB` method to retrieve the database instance
                const collection = db.collection('user'); // Replace 'user' with your collection name

                let response = {}

                // Find the user by email
                const admin = await collection.findOne({ Email: loginData.Email, role: 'admin' });
                console.log(admin)
                if (!admin) {
                    console.log('User not found');
                    resolve({status:false}, 'User not found');
                } else {
                    // Compare the provided password with the hashed password
                    const isPasswordMatch = await bcrypt.compare(loginData.password, admin.password);

                    if (isPasswordMatch) {
                        console.log('Login successful');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('Incorrect password');
                        resolve({ status: false })
                    }
                }
            } catch (err) {
                console.error('Error logging in user:', err);
                resolve({ status: false })
            }
        }
        )
    },
    getalluser: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('user'); // Replace 'products' with your collection name
            const userDetails = await collection.find({ Approval: false }).toArray(); // Retrieve all documents from the collection
            console.log('Products retrieved successfully');
            callback(userDetails);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
    acceptUser: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('user');
                const result = await collection.updateOne(
                    { _id: new ObjectId(userId) }, // Filter by product's ObjectId
                    {
                        $set: {
                            Approval: true,
                        },
                    }
                );

                resolve(result) // Return the result of the update operation
            } catch (err) {
                console.error('Error updating product:', err); // Correct error message
                throw err; // Propagate error for further handling
            }
        }
        )
    },
    deleteUser: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('user');

                const result = await collection.deleteOne({ _id: new ObjectId(userId) }); // Filter by product's ObjectId

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
    deleteTurf: async (turfId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('turf');

                const result = await collection.deleteOne({ _id: new ObjectId(turfId) }); // Filter by product's ObjectId

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
    deleteEv: async (evId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('EV');

                const result = await collection.deleteOne({ _id: new ObjectId(evId) }); // Filter by product's ObjectId

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
    deletePool: async (poolId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('pool');

                const result = await collection.deleteOne({ _id: new ObjectId(poolId) }); // Filter by product's ObjectId

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
    deleteHall: async (hallId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = getDB();
                const collection = db.collection('auditorium');

                const result = await collection.deleteOne({ _id: new ObjectId(hallId) }); // Filter by product's ObjectId

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
    getEvDetails: (evId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('EV'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(evId) })
                    .then((ev) => {
                        resolve(ev); // Resolve with the product details
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
    getTurfDetails: (turfId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('turf'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(turfId) })
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
    getPoolDetails: (poolId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('pool'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(poolId) })
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
    getHallDetails: (hallId) => {
        return new Promise((resolve, reject) => {
            try {
                const db = getDB(); // Get the database instance
                const collection = db.collection('auditorium'); // Use the 'products' collection

                // Fetch a product using `findOne`
                collection.findOne({ _id: new ObjectId(hallId) })
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
    getAllUser: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('user'); // Replace 'products' with your collection name
            const users = await collection.find().toArray(); // Retrieve all documents from the collection
            console.log('Products retrieved successfully');
            callback(users);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
    getAllBooking: async (callback) => {
        try {
            const db = getDB(); // Use the `getDB` method to retrieve the database instance
            console.log(getDB);
            const collection = db.collection('slot_booking'); // Replace 'products' with your collection name
            const users = await collection.find().toArray(); // Retrieve all documents from the collection
            console.log('Products retrieved successfully');
            callback(users);
        } catch (err) {
            console.error('Error retrieving products:', err);
        }
    },
};