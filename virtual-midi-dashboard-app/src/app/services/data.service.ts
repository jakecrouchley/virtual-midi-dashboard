import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICell, DATA_VERSION } from '../../../../common';

import * as semver from 'semver';

export const CELL_LOCAL_STORAGE_KEY = 'CELLS';
export const RECENTLY_USED_ICONS_KEY = 'RECENTLTY_USED_ICONS';

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
    // TODO: condense this in one place and alert user that invalid cells will be omitted
    const validCells = cells.filter(
      (cell: ICell) => cell.version && semver.gte(cell.version, DATA_VERSION)
    );
    this.cells$.next(validCells);
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
        return cells.filter(
          (cell: ICell) =>
            cell.version && semver.gte(cell.version, DATA_VERSION)
        );
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
