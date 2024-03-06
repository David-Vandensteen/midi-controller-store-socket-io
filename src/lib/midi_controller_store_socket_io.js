import { MidiControllerStore } from 'midi-controller-store';
import io from 'socket.io-client';

export default class MidiControllerStoreSocketIO extends MidiControllerStore {
  #io;

  constructor(options = {}, host = 'http://localhost:3000') {
    super();
    this.#io = io.connect(host, options);
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
