// Import the 'http' module
const http = require('http');

// Create a simple server
var sever = http.createServer((req, res) => {
  // Set the response header (status code and content type)
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  // Send a response to the client
  res.end('Hello, world!\n');
});

// Listen on port 3000
sever.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
