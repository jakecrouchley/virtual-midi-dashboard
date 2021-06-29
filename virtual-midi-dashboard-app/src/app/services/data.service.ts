import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const CELL_LOCAL_STORAGE_KEY = 'CELLS';
export const RECENTLY_USED_ICONS_KEY = 'RECENTLTY_USED_ICONS';

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

  setCells(cells: ICell[]) {
    this.cells$.next(cells);
  }

  addCell(cell: ICell) {
    this.cells$.next([...this.cells$.value, cell]);
  }

  getCellAtIndex(index: number) {
    return this.cells$.value.find((cell) => cell.index === index);
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

  getRecentlyUsedIconList(): string[] {
    // Add stored recently used icons to list
    const recentlyUsedIconsString = localStorage.getItem(
      RECENTLY_USED_ICONS_KEY
    );
    if (recentlyUsedIconsString) {
      return JSON.parse(recentlyUsedIconsString) as string[];
    }
    return [];
  }

  addIconToRecentlyUsedList(iconName: string) {
    let recentlyUsedIcons = this.getRecentlyUsedIconList();
    if (recentlyUsedIcons) {
      recentlyUsedIcons = recentlyUsedIcons.filter(
        (recentIconName) => recentIconName !== iconName
      );
      recentlyUsedIcons.splice(0, 0, iconName);
      localStorage.setItem(
        RECENTLY_USED_ICONS_KEY,
        JSON.stringify(recentlyUsedIcons.slice(0, 5))
      );
    } else {
      localStorage.setItem(RECENTLY_USED_ICONS_KEY, JSON.stringify([iconName]));
    }
  }
}
