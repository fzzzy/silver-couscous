
all: client server

build/client:
	mkdir -p build/client

build/client/client-bundle.js: build/client client/client.js
	webpack client/client.js build/client/client-bundle.js

build/client/index.html: build/client client/index.html
	cp client/index.html build/client/index.html

build/client/scripts: build/client
	cp -R client/scripts build/client

build/server:
	mkdir -p build/server

build/server/server-bundle.js: build/server server/server.js
	node_modules/babel-cli/bin/babel.js server/server.js -o build/server/server-bundle.js

build/client/engine.io.js:
	mkdir -p build/client
	cp node_modules/engine.io-client/engine.io.js build/client/engine.io.js

client: build/client/client-bundle.js build/client/engine.io.js build/client/index.html build/client/scripts

server: build/server/server-bundle.js

clean:
	rm -rf build


