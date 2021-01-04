const http = require('http');

/*
const fs = require('fs');

try {
  const data = fs.readFileSync('index.html', 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}
*/

const server = http.createServer(function(req, res) {
	res.write("Hello, world!");
	res.end();
});

server.listen(80, function() {
	console.log('Server running at http://127.0.0.1:80');
});