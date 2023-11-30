// websocket
const { Console } = require('console');
const Html5WebSocket = require('html5-websocket');
const ReconnectingWebSocket = require('reconnecting-websocket');

// websocket initialization
// let ws_host = '192.168.1.33';
let ws_host = 'localhost';
let ws_port = '3000';
let nm = 'John'
const options = { WebSocket: Html5WebSocket };
const rws = new ReconnectingWebSocket('ws://' + ws_host + ':' + ws_port + '/ws', undefined, options);
rws.timeout = 1000;

if (process.argv.length === 5) {
    ws_host = process.argv[2];
    ws_port = process.argv[3];
    nm = process.argv[4];
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
 });
  
// readline.question('Who are you?', name => {
//     console.log(`Hey there ${name}!`);
//     rws.send(name);
//     readline.close();
// });


rws.addEventListener('open', () => {
    console.log('[Client] Connection to WebSocket server was opened.');
    // rws.send('Hello, this is a message from a client.');
    sendMessage("test", "handshake");
    waitForUserInput();
});

function sendMessage(msg, type) {
    if (type == "background") {
        rws.send(JSON.stringify({
            method: 'set-background-color',
            params: {
                color: msg
            }
        }));
    }
    else if (type == "handshake") {
        rws.send(JSON.stringify({
            method: 'handshake',
            params: {
                name: nm,
                msg
            }
        }));
    }
    else {
        rws.send(JSON.stringify({
            method: 'textMessage',
            params: {
                name: nm,
                msg
            }
        }));
    }
}

rws.addEventListener('message', (e) => {
    // console.log('[Client] Message received: ' + e.data);

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
    },
    "textMessage": function(m) {
        console.log(`[${m.params.name}] ${m.params.msg}`);
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


function waitForUserInput() {
    readline.question("", function(answer) {
      if (answer == "exit"){
          readline.close();
      }
      else {
          sendMessage(answer);
          waitForUserInput();
      }
    });
}

