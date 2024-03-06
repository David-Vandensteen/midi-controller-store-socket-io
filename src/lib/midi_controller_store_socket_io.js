import { MidiControllerStore } from 'midi-controller-store';
import io from 'socket.io-client';

let instance;

export default class MidiControllerStoreSocketIO extends MidiControllerStore {
  #io;

  constructor(options = {}, host = 'http://localhost:3000') {
    super();
    this.#io = io.connect(host, options);
  }

  static getInstance(options = {}) {
    if (!instance) instance = new MidiControllerStoreSocketIO(options);
    return instance;
  }

  clear() {
    super.clear();
    this.#io.emit('clear');
  }

  set(controller, channel, value) {
    super.set(controller, channel, value);
    this.#io.emit('data', { controller, channel, value });
  }
}

export { MidiControllerStoreSocketIO };
