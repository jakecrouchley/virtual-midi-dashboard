import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MidiEvent } from './midi.service';

export interface ICell {
  note: number;
  velocity: number;
  label: string;
  event: MidiEvent;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private cells$: BehaviorSubject<ICell[]> = new BehaviorSubject<ICell[]>([
    {
      note: 64,
      velocity: 127,
      label: 'Test',
      event: 'noteon',
    },
  ]);

  constructor() {}

  getCells(): Observable<ICell[]> {
    return this.cells$;
  }

  appendCell(cell: ICell) {
    this.cells$.next([...this.cells$.value, cell]);
  }
}
