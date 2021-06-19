import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

export const MIDI_CHANNEL = 1;
export const SERVER_URL = 'http://localhost:8080';

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
    return this.http.post(SERVER_URL + '/send-midi', {
      note,
      velocity,
    });
  }
}
