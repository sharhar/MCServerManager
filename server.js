const http = require('http');
const fs = require('fs');
const { exec } = require("child_process");
const { spawn } = require("child_process");
const {streamWrite, streamEnd, onExit} = require('@rauschma/stringio');

var start_requested = false;
var server_running = false;

var raw_html_data = "";

try {
  raw_html_data = fs.readFileSync('index.html', 'utf8');
} catch (err) {
  console.error(err);
}

var proc = null;

const server = http.createServer(function(req, res) {
	if(req.method === 'POST') {
		if(req.url == "/click") {
			start_requested = true;
		} 

		if(proc != null) {
			if (req.url.startsWith("/stop")) {
				var pass = req.url.substring(6);
				if(pass == "shahariscool") {
					streamWrite(proc.stdin, 'stop\n');
					streamEnd(proc.stdin);
				}
			} else if (req.url == "/day") {
					streamWrite(proc.stdin, 'time set day\n');
			} else if (req.url == "/night") {
					streamWrite(proc.stdin, 'time set night\n');
			} else if (req.url == "/wc") {
					streamWrite(proc.stdin, 'weather clear\n');
			} else if (req.url.startsWith("/tp")) {
					var url_parts = req.url.split("-");
					streamWrite(proc.stdin, "tp " + url_parts[1] + " " + url_parts[2] + '\n');
			}
		}

		res.write('{"status": "ok"}');
		res.end();
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
			if(process.argv[2] == "--dynamic" || process.argv[2] == "-d" ) {
				try {
				  raw_html_data = fs.readFileSync('index.html', 'utf8');
				} catch (err) {
				  console.error(err);
				}
			}
			
			res.write(raw_html_data);
			res.end();
		}
	}
});

server.listen(80, function() {
	console.log('Server running at http://127.0.0.1:80');
});

function custom_log(dat) {
	if(dat.endsWith("\n")) {
		dat = dat.substring(0, dat.length - 1);
	}
	console.log(dat);
}

function serverStarter() {
	if(start_requested && !server_running) {
		server_running = true;

		proc = spawn("bash", ["server/start.sh"]);

		proc.stdout.on("data", data => {
		    custom_log(`${data}`);
		});

		proc.stderr.on("data", data => {
		    console.log(`stderr: ${data}`);
		});

		proc.on('error', (error) => {
		    console.log(`error: ${error.message}`);
		});

		proc.on("close", code => {
			server_running = false;
			start_requested = false;
			proc = null;
		    console.log(`child process exited with code ${code}`);
		});
	}

	start_requested = false;

	setTimeout(serverStarter, 1000); 
}

setTimeout(serverStarter, 0); 
