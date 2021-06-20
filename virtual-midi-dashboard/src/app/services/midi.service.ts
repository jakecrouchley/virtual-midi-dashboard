import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode, OnDestroy } from '@angular/core';

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

  sendMidiNoteOn(note: number, velocity: number = 127) {
    return this.http.post(this.getBaseURL() + '/send-midi', {
      note,
      velocity,
    });
  }

  getBaseURL(): string {
    return isDevMode() ? 'http://localhost:8080' : '';
  }
}
