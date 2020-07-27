# mpv-json-ipc

JSON-IPC wrapper for mpv

## Install

```
npm install mpv-json-ipc
```

## Example

```javascript
import { MpvJsonIpc } from 'mpv-json-ipc';

const socket = net.createConnection('your input-ipc-server');

const jsonIpc = new MpvJsonIpc(socket);

jsonIpc.on('file-loaded', () => console.log('file-loaded');

const path = jsonIpc.command('loadfile', 'my file');

```
