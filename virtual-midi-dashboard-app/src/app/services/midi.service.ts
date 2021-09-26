import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode, OnDestroy } from '@angular/core';
import { ICCCell, IMIDICell } from '../../../../common';

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
    this.webSocket?.send(JSON.stringify(cell));
    // return this.http.post(this.getBaseURL() + '/send-midi', cell);
  }

  sendMidiNoteOff(cell: IMIDICell) {
    this.webSocket?.send(JSON.stringify(cell));
    // return this.http.post(this.getBaseURL() + '/send-midi-off', cell);
  }

  sendCC(cell: ICCCell) {
    this.webSocket?.send(JSON.stringify(cell));
    // return this.http.post(this.getBaseURL() + '/send-cc', {
    //   controller: cell.controller,
    //   value: cell.value,
    // });
  }

  getBaseURL(): string {
    return isDevMode() ? 'http://localhost:8080' : '';
  }
}
