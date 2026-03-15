const https = require('https');
https.get('https://res.cloudinary.com/dz2eif2dn/image/upload/e_background_removal/v1/sample', (res) => {
  console.log('Status Code:', res.statusCode);
});
