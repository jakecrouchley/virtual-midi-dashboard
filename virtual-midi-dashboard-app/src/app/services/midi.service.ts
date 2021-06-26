import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode, OnDestroy } from '@angular/core';
import { ICCCell, IMIDICell } from './data.service';

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
  constructor(private http: HttpClient) {}

  sendMidiNoteOn(cell: IMIDICell) {
    return this.http.post(this.getBaseURL() + '/send-midi', cell);
  }

  sendMidiNoteOff(cell: IMIDICell) {
    return this.http.post(this.getBaseURL() + '/send-midi-off', cell);
  }

  sendCC(cell: ICCCell) {
    return this.http.post(this.getBaseURL() + '/send-cc', {
      controller: cell.controller,
      value: cell.value,
    });
  }

  getBaseURL(): string {
    return isDevMode() ? 'http://localhost:8080' : '';
  }
}
