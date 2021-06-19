import { Injectable, OnDestroy } from '@angular/core';

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
  // virtualOutput?: Output;
  // constructor() {
  //   this.virtualOutput = new Output('Virtual MIDI Dashboard', true);
  // }
  // sendMidiNoteOn(note: number, velocity: number = 127) {
  //   const params: Note = {
  //     note,
  //     velocity,
  //     channel: MIDI_CHANNEL,
  //   };
  //   this.virtualOutput?.send('noteon', params);
  // }
  // ngOnDestroy(): void {
  //   this.virtualOutput?.close();
  // }
}
