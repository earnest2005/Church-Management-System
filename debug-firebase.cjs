const https = require('https');

const apiKey = "AIzaSyAJdsJMa8cSSXBjow4fuAnjfO9kYj_MEe0";
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

const data = JSON.stringify({
  email: "test@example.com",
  password: "password123",
  returnSecureToken: true
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(url, options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', JSON.parse(responseBody));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
