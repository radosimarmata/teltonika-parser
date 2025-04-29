# README

### Source
Forked from: https://www.npmjs.com/package/teltonika-parser

### Usage example

```
  const net = require('net');
  const Parser = require('teltonika-parser-ex');

  let server = net.createServer((c) => {
    console.info('[INFO] New client connected');
    c.on('end', () => console.info('[INFO] Client disconnected'));

    c.on('data', (data) => {
      let buffer = data;
      let parser = new Parser(buffer);
      if(parser.isImei){
        c.write(Buffer.alloc(1,1));
      } else {
        let avl = parser.getAvl();
        const ack = Buffer.alloc(4);
        ack.writeUInt32BE(avl.number_of_data, 0);
        c.write(ack);
      }
    });
  });

  c.on('error', (err) => {
    switch (err.code) {
      case 'ECONNRESET':
        console.error('Connection reset by peer ', err);
        break;
      case 'EPIPE':
        console.error('Broken pipe', err);
        break;
      case 'ETIMEDOUT':
        console.error('Connection timed out', err);
        break;
      case 'ECONNREFUSED':
        console.error('Connection refused', err);
        break;
      default:
        console.error('Error ', err);
    }
  })

  server.listen(5000, () => {
    console.info("[INFO] Server listening on port 5000");
  })
```