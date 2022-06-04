import { Injectable } from '@angular/core';
import { ICCEvent, IInputEvent, IMIDIEvent } from '../../../../common';

export const MIDI_CHANNEL = 1;

export type MidiEvent =
  | 'noteon'
  | 'noteoff'
  | 'poly aftertouch'
  | 'cc'
  | 'program'
  | 'channel aftertouch'
  | 'pitch'
  | 'position'
  | 'mtc'
  | 'select'
  | 'clock'
  | 'start'
  | 'continue'
  | 'stop'
  | 'activesense'
  | 'reset'
  | 'sysex';

@Injectable({
  providedIn: 'root',
})
export class MidiService {
  webSocket?: WebSocket;

  constructor() {
    this.webSocket = new WebSocket('ws://localhost:8082');
    this.webSocket.onmessage = this.onMessageReceived;
  }

  sendMidiNote(event: IMIDIEvent) {
    this.webSocket?.send(JSON.stringify(event));
  }

  sendCC(event: ICCEvent) {
    this.webSocket?.send(JSON.stringify(event));
  }

  onMessageReceived(message: MessageEvent<any>): any {
    try {
      const event: IInputEvent = JSON.parse(message.data);
      console.log(event);
    } catch (error: any) {
      console.error(error);
    }
  }
}
