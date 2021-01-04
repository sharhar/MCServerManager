const http = require('http');
const fs = require('fs');

var raw_html_data = "";

try {
  raw_html_data = fs.readFileSync('index.html', 'utf8');
} catch (err) {
  console.error(err);
}

var stati = ['<div style="color: red;">Offline</div>', '<div style="color: orange;">Initializing...</div>', '<div style="color: green;">Online</div>'];

var html_sections = raw_html_data.split("___");

const server = http.createServer(function(req, res) {
	var raw_status_data = "";

	try {
	  raw_status_data = fs.readFileSync('status.json', 'utf8');
	} catch (err) {
	  console.error(err);
	}

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

		console.log(server_status.players);
	} else if (server_status.status == 0) {
		final_html += stati[0] + "</h1>"; //TODO: add button to start server
	} else {
		final_html += stati[1] + "</h1><br><h5>Server initialization will take several minutes. Please be patient.</h5>";
	}

	final_html += html_sections[1];

	res.write(final_html);
	res.end();
});

server.listen(80, function() {
	console.log('Server running at http://127.0.0.1:80');
});