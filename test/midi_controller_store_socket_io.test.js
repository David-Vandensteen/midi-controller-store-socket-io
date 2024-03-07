import assert from 'node:assert';
import {
  describe,
  it,
  before,
  after,
} from 'node:test';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pTimeout from 'p-timeout';
import { MidiControllerStoreSocketIO } from '#src/index';

describe('test Midi Controller Store Socket IO', () => {
  let httpServer;
  let io;
  let midiStore;

  before(() => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(3000);
    midiStore = new MidiControllerStoreSocketIO({ reconnect: true });
  });

  after(() => {
    setTimeout(() => {
      httpServer.close();
      process.exit();
    }, 300);
  });

  it('should connect', async () => {
    const connect = () => new Promise((resolve) => {
      io.on(
        'connection',
        async () => resolve('connection'),
      );
    });

    assert(
      midiStore instanceof MidiControllerStoreSocketIO,
      new Error('not an instance of MidiControllerStoreSocketIO'),
    );

    assert(
      await pTimeout(
        connect(),
        {
          milliseconds: 50,
          fallback: () => Promise.reject(
            new Error('with 50 ms time out, connection error'),
          ),
        },
      ),
      new Error('connection error'),
    );
  });

  it('should emit and receive valid MIDI data', async () => {
    const listen = () => new Promise((resolve, reject) => {
      io.on('connection', (socket) => {
        socket.on('data', (data) => {
          try {
            assert.strictEqual(data?.controller, 10, 'invalid received controller data');
            assert.strictEqual(data?.channel, 1, 'invalid received channel data');
            assert.strictEqual(data?.value, 15, 'invalid received value data');
            return resolve(data);
          } catch (error) {
            Error(error);
            return reject(error);
          }
        });
      });
    });

    midiStore = new MidiControllerStoreSocketIO({ reconnect: true });
    midiStore.set(10, 1, 15);
    assert(await listen());
  });

  it('should emit and receive valid MIDI data whith singleton', async () => {
    const listen = () => new Promise((resolve, reject) => {
      io.on('connection', (socket) => {
        socket.on('data', (data) => {
          try {
            assert.strictEqual(data?.controller, 10, 'invalid received controller data');
            assert.strictEqual(data?.channel, 1, 'invalid received channel data');
            assert.strictEqual(data?.value, 15, 'invalid received value data');
            return resolve(data);
          } catch (error) {
            Error(error);
            return reject(error);
          }
        });
      });
    });

    midiStore = MidiControllerStoreSocketIO.getInstance();
    midiStore.set(10, 1, 15);
    assert(await listen());
  });

  it('should reveive clear command', async () => {
    const listenClear = () => new Promise((resolve) => {
      io.on('connection', (socket) => {
        socket.on('clear', () => resolve('clear'));
      });
    });

    midiStore = new MidiControllerStoreSocketIO({ reconnect: true });
    midiStore.clear();

    assert(
      await pTimeout(
        listenClear(),
        {
          milliseconds: 50,
          fallback: () => Promise.reject(
            new Error('with 50 ms time out, clear command not received'),
          ),
        },
      ),
    );
  });
});
