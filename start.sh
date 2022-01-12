#!/bin/bash
cd server
echo '{"status": 5, "players": []}' > status.json
/usr/lib/jvm/java-17-openjdk/bin/java -Xmx20G -jar server.jar
echo '{"status": 0, "players": []}' > status.json
