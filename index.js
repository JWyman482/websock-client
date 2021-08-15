// websocket
const Html5WebSocket = require('html5-websocket');
const ReconnectingWebSocket = require('reconnecting-websocket');

// websocket initialization
let ws_host = 'localhost';
let ws_port = '3000';
const options = { WebSocket: Html5WebSocket };
const rws = new ReconnectingWebSocket('ws://' + ws_host + ':' + ws_port + '/ws', undefined, options);
rws.timeout = 1000;

rws.addEventListener('open', () => {
    console.log('[Client] Connection to WebSocket server was opened.');
    rws.send('Hello, this is a message from a client.');
    rws.send(JSON.stringify({
        method: 'set-background-color',
        params: {
            color: 'blue'
        }
    }));
});

rws.addEventListener('message', (e) => {
    console.log('[Client] Message received: ' + e.data);

    try {
        let m = JSON.parse(e.data);
        handleMessage(m);
    } catch(err) {
        console.log('[Client] Message is not parseable')
    }
});

rws.addEventListener('close', () => {
    console.log('[Client] Connection closed.');
});

rws.onerror = (err) => {
    if(err.code == 'EHOSTDOWN') {
        console.log('[Client] Error: Server Down');
    }
}
// handlers

let handlers = {
    "set-background-color": function(m) {
        // ...
        console.log('[Client] set-background-color');
        console.log('[Client] Color is ' + m.params.color);
    }
};

function handleMessage(e) {

    if (e.method == undefined) {
        return;
    }

    let method = e.method;

    if (method) {
        if (handlers[method]) {
            let handler = handlers[method];
            handler(e);
        } else {
            console.log("[CLIENT] Don't have a handler for that:" + method);
        }
    }

}
