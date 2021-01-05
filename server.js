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

var html_sections = raw_html_data.split("___");

var stati = ['<div style="color: red;">Offline</div>', '<div style="color: orange;">Initializing...</div>', '<div style="color: green;">Online</div>'];

const server = http.createServer(function(req, res) {
	if(req.method === 'POST') {
		if(req.url == "/click") {
			start_requested = true;
		} else if (req.url == "/check") {
			var raw_status_data = "";

			try {
			  raw_status_data = fs.readFileSync('server/status.json', 'utf8');
			} catch (err) {
			  console.error(err);
			}
			
			res.end(raw_status_data);
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
			var server_status = JSON.parse(raw_status_data);

			var final_html = html_sections[0];

			final_html += "<h1>FTB Server Status";

			if(server_status.status == 5) {
				final_html += stati[2] + "</h1><br><h5>Players Currently Online (" + server_status.players.length +")</h5>";

				var player_list = "";

				for(var i = 0; i < server_status.players.length; i++) {
					player_list += "<br>" + server_status.players[i];
				}

				final_html += player_list.substring(4);
			} else if (server_status.status == 0) {
				final_html += stati[0] + "</h1><button type=\"button\" class=\"btn btn-outline-success btn-lg\" id=\"serverStartButton\" onclick=\"fetch('/click', {method: 'POST'})\">Start Server</button>";
			} else {
				final_html += stati[1] + "</h1><br><h5>Server initialization will take several minutes. Please be patient.</h5>";
			}

			final_html += html_sections[1];

			res.write(final_html);
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
