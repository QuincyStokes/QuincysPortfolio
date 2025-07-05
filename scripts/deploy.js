const https = require('https');

const RENDER_TOKEN = process.env.RENDER_TOKEN;
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;

if (!RENDER_TOKEN || !RENDER_SERVICE_ID) {
  console.error('Missing required environment variables: RENDER_TOKEN and RENDER_SERVICE_ID');
  process.exit(1);
}

const options = {
  hostname: 'api.render.com',
  port: 443,
  path: `/v1/services/${RENDER_SERVICE_ID}/deploys`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RENDER_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 201) {
      console.log('✅ Deployment triggered successfully!');
      console.log('Response:', JSON.parse(data));
    } else {
      console.error('❌ Failed to trigger deployment');
      console.error('Status:', res.statusCode);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error triggering deployment:', error);
});

req.write(JSON.stringify({}));
req.end(); 