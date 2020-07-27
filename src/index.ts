import net from 'net';
import { EventEmitter } from 'events';

export interface EventResponse {
  [index: string]: unknown;
  event: string;
}

export interface CommandResponse {
  error: string;
  data?: unknown;
  request_id: number;
}

export interface MpvJsonIpc {
  addListener(event: string, listener: (response: EventResponse) => void): this;
  on(event: string, listener: (response: EventResponse) => void): this;
  once(event: string, listener: (response: EventResponse) => void): this;
  removeListener(event: string, listener: (response: EventResponse) => void): this;
  off(event: string, listener: (response: EventResponse) => void): this;
  prependListener(event: string, listener: (response: EventResponse) => void): this;
  prependOnceListener(event: string, listener: (response: EventResponse) => void): this;
}

export class MpvJsonIpc extends EventEmitter {
  readonly socket: net.Socket;
  private _callbacks = new Map<number, (response: CommandResponse) => void>();
  private _requestId = 0;

  constructor(socket: net.Socket) {
    super();
    this.socket = socket;

    socket.on('data', this._onData);
  }

  private _onData = (data: Buffer): void => {
    const lines = data.toString().split('\n');

    for (const line of lines) {
      let response;
      try {
        response = JSON.parse(line) as EventResponse | CommandResponse;
      } catch (e) {
        return;
      }

      if ('event' in response) {
        this.emit(response.event, response);
        return;
      }

      if (typeof response.request_id === 'number') {
        const cb = this._callbacks.get(response.request_id);
        if (cb) {
          this._callbacks.delete(response.request_id);
          try {
            cb(response as CommandResponse);
          } catch (e) {
            // Do nothing
          }
        }
      }
    }
  }

  command = (...args: unknown[]): Promise<CommandResponse> => {
    this._requestId = (this._requestId + 1) % (2**32 - 1);

    const cmd = {
      command: args,
      'request_id': this._requestId
    };

    return new Promise<CommandResponse>((resolve, reject) => {
      const cb = (response: CommandResponse) => {
        resolve(response);
      }

      this._callbacks.set(this._requestId, cb);

      try {
        this.socket.write(JSON.stringify(cmd) + '\n');
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Removes any event-listener installed on the socket.
   */
  destroy = (): void => {
    this.socket.off('data', this._onData);
  }
}
