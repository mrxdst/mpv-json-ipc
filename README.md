# mpv-json-ipc

JSON-IPC wrapper for mpv

## Install

```
npm install mpv-json-ipc
```

## Example

```javascript
import net from 'net';
import { MpvJsonIpc } from 'mpv-json-ipc';

const socket = net.createConnection('your input-ipc-server');

const jsonIpc = new MpvJsonIpc(socket);

jsonIpc.on('file-loaded', async () => {
  console.log('file-loaded');

  const duration = await jsonIpc.command('get_property', 'duration');

  console.log(`Duration: ${duration.data}`);
});

socket.on('connect', async () => {
  await jsonIpc.command('loadfile', 'my file');
});
```
