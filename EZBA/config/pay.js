const axios = require('axios');
const crypto = require('crypto');


const clientId = 'ff77c1a3270e9ce0486774e36478ca656671771d12168f969002c462e30b64aa';  // Replace with your PayU Client ID
const clientSecret = '781fe5e42afcd0caf68828694476aeb17f21d8aba686cd858d6d4011ea0dca3f';  // Replace with your PayU Client Secret

// PayU API endpoint for getting access token
const tokenUrl = 'https://secure.payu.in/security/getToken';
const orderUrl = 'https://test.payu.in/_payment';  // Endpoint to create order

async function getAccessToken() {
  const requestData = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    const response = await axios.post(tokenUrl, requestData);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

// Step 2: Create payment order
async function createPaymentOrder(accessToken, paymentData) {
  try {
    const response = await axios.post(orderUrl, paymentData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,  // Authorization header with the access token
      },
    });
    return response.data;  // Return the response data
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
}


router.post('/pay', async (req, res) => {
    const { slot, userId, turf, amount } = req.body;  // Get slot, userId, turf, and amount from the form submission
  
    // Prepare payment details
    const key = 'FDVU1D';
    const txnid = `txn_${Date.now()}`;
    const productinfo = '3pm-4pm Turf Booking';
    const firstname = 'John';
    const email = 'user@example.com';
    const phone = '1234567890';
    const salt = 'RGgYkET7nuwSiaLS6z7oi2r1kmi19Ecb';
  
    // Generate the hash for payment
    const hashString = key + txnid + amount + productinfo + firstname + email + salt;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    const paymentData = {
      key: key,
      txnid: txnid,
      amount: amount,
      productinfo: productinfo,
      firstname: firstname,
      email: email,
      phone: phone,
      hash: hash,  // Send the generated hash
      surl: 'http://localhost:3000/success', // Success URL
      furl: 'http://localhost:3000/failure', // Failure URL
    };
  
    try {
      // Get access token from PayU
      const accessToken = await getAccessToken();
      
      // Create payment order with PayU
      const response = await createPaymentOrder(accessToken, paymentData);
  
      if (response.status === 'success') {
        res.redirect(response.paymentUrl);  // Redirect to PayU payment page
      } else {
        res.redirect('/failure');  // Redirect to failure page if status is not success
      }
    } catch (err) {
      console.error('Payment request failed', err);
      res.redirect('/failure');
    }
  });
  
  // Success and failure routes
  router.get('/success', (req, res) => {
    res.send('Payment successful!');
  });
  
  router.get('/failure', (req, res) => {
    res.send('Payment failed!');
  });

  