
all: client server

build/client-bundle.js: client/client.js
	webpack client/client.js build/client-bundle.js

build/index.html: client/index.html
	cp client/index.html build/index.html

build/server-bundle.js: server/server.js
	node_modules/babel-cli/bin/babel.js server/server.js -o build/server-bundle.js


client: build/client-bundle.js build/index.html

server: build/server-bundle.js

clean:
	rm -rf build


