import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const CELL_LOCAL_STORAGE_KEY = 'CELLS';
export interface ICell {
  label: string;
  type: 'midi' | 'cc';
  iconName: string;
  index: number;
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
  cells$: BehaviorSubject<ICell[]> = new BehaviorSubject<ICell[]>([]);

  constructor() {
    // Use any previously stored cells
    const localCells = this.fetchStoredCells();
    if (localCells) {
      this.cells$.next(localCells);
    }

    // Store cells each time they change
    this.cells$.subscribe((cells) => {
      this.storeCells(cells);
    });
  }

  appendCell(cell: ICell) {
    this.cells$.next([...this.cells$.value, cell]);
  }

  removeCell(index: number) {
    const newCells = this.cells$.value;
    const indexToRemove = newCells.findIndex((cell) => cell.index === index);
    newCells.splice(indexToRemove, 1);
    this.cells$.next(newCells);
  }

  storeCells(cells: ICell[]) {
    const jsonCells = JSON.stringify(cells);
    localStorage.setItem(CELL_LOCAL_STORAGE_KEY, jsonCells);
  }

  fetchStoredCells(): ICell[] | null {
    const storedCells = localStorage.getItem(CELL_LOCAL_STORAGE_KEY);
    if (storedCells) {
      try {
        const cells = JSON.parse(storedCells);
        return cells;
      } catch (error) {
        console.error(error);
        return null;
      }
    } else {
      return null;
    }
  }
}
