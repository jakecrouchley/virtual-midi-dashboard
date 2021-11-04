import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICCCell, IMIDICell, MIDIEvent } from '../../../../common';

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

  constructor(private http: HttpClient) {
    this.webSocket = new WebSocket('ws://localhost:8082');
  }

  sendMidiNoteOn(cell: IMIDICell) {
    this.webSocket?.send(
      JSON.stringify({
        action: 'on',
        cell,
        velocity: cell.velocity,
      } as MIDIEvent)
    );
  }

  sendMidiNoteOff(cell: IMIDICell) {
    this.webSocket?.send(
      JSON.stringify({
        action: 'off',
        cell,
      } as MIDIEvent)
    );
  }

  sendCC(cell: ICCCell) {
    this.webSocket?.send(
      JSON.stringify({
        action: 'on',
        cell,
        value: cell.value,
      })
    );
  }
}
