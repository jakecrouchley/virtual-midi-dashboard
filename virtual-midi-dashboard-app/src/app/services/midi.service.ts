import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ICCEvent, IInputEvent, IMIDIEvent } from '../../../../common';

export const MIDI_CHANNEL = 1;

@Injectable({
  providedIn: 'root',
})
export class MidiService {
  webSocket?: WebSocket;

  incomingMessages$ = new Subject<IInputEvent>();

  constructor() {
    this.webSocket = new WebSocket(`ws://${location.hostname}:8082`);
    this.webSocket.onmessage = (message) => this.onMessageReceived(message);
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
      this.incomingMessages$.next(event);
    } catch (error: any) {
      console.error(error);
    }
  }
}
