import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MidiEvent } from './midi.service';

export interface ICell {
  label: string;
  type: 'midi' | 'cc';
  iconName: string;
}

export interface IMIDICell extends ICell {
  note: number;
  velocity: number;
}

export interface ICCCell extends ICell {
  controller: number;
  value: number;
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
      type: 'midi',
    } as IMIDICell,
  ]);

  constructor() {}

  getCells(): Observable<ICell[]> {
    return this.cells$;
  }

  appendCell(cell: ICell) {
    this.cells$.next([...this.cells$.value, cell]);
  }
}
