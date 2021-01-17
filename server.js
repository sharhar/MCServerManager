const http = require('http');
const fs = require('fs');
const { exec } = require("child_process");
const { spawn } = require("child_process");

var start_requested = false;
var server_running = false;

var raw_html_data = "";

try {
  raw_html_data = fs.readFileSync('index.html', 'utf8');
} catch (err) {
  console.error(err);
}

const server = http.createServer(function(req, res) {
	if(req.method === 'POST') {
		if(req.url == "/click") {
			start_requested = true;
		}
	} else {
		var raw_status_data = "";

		try {
		  raw_status_data = fs.readFileSync('server/status.json', 'utf8');
		} catch (err) {
		  console.error(err);
		}

		if(req.url == '/check') {
			res.end(raw_status_data);
		} else {
			res.write(raw_html_data);
			res.end();
		}
	}
});

server.listen(80, function() {
	console.log('Server running at http://127.0.0.1:80');
});

function serverStarter() {
	if(start_requested && !server_running) {
		server_running = true;

		const proc = spawn("bash", ["server/start.sh"]);

		proc.stdout.on("data", data => {
		    console.log(`stdout: ${data}`);
		});

		proc.stderr.on("data", data => {
		    console.log(`stderr: ${data}`);
		});

		proc.on('error', (error) => {
		    console.log(`error: ${error.message}`);
		});

		proc.on("close", code => {
			server_running = false;
		    console.log(`child process exited with code ${code}`);
		});
	}

	start_requested = false;

	setTimeout(serverStarter, 1000); 
}

setTimeout(serverStarter, 0); 
