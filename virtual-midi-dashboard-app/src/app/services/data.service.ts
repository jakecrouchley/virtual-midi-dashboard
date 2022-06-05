import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICell, DATA_VERSION } from '../../../../common';

import * as semver from 'semver';

export const CELL_LOCAL_STORAGE_KEY = 'CELLS';
export const NUM_COLS_LOCAL_STORAGE_KEY = 'NUM_COLS';
export const RECENTLY_USED_ICONS_KEY = 'RECENTLTY_USED_ICONS';
export const FILE_NAME_KEY = 'FILE_NAME';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  cells$: BehaviorSubject<ICell[]> = new BehaviorSubject<ICell[]>([]);
  numberOfCols$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor() {
    // Use any previously stored values
    const localCells = this.fetchStoredCells();
    if (localCells) {
      this.cells$.next(localCells);
    }
    const storedColNum = this.fetchStoredColNum();
    if (storedColNum) {
      this.numberOfCols$.next(storedColNum);
    }

    // Store cells each time they change
    this.cells$.subscribe((cells) => {
      this.storeCells(cells);
    });
    this.numberOfCols$.subscribe((value) => {
      this.storeColNum(value);
    });
  }

  setCells(cells: ICell[]) {
    // TODO: condense this in one place and alert user that invalid cells will be omitted
    const validCells = cells.filter(
      (cell: ICell) => cell.version && semver.gte(cell.version, DATA_VERSION)
    );
    this.cells$.next(validCells);
  }

  /**
   * Replace the cell currently at the index cellToUpdate.index with the passed cell's data
   * @param cellToUpdate Cell to update the cells array with
   */
  replaceCell(cellToUpdate: ICell) {
    const cells = this.cells$.value;
    const indexToUpdate = cells.findIndex(
      (cell) => cell.index === cellToUpdate.index
    );
    cells[indexToUpdate] = cellToUpdate;
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
    newCells.splice(indexToRemove);
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

  storeColNum(value: number) {
    const storedValue = JSON.stringify(value);
    localStorage.setItem(NUM_COLS_LOCAL_STORAGE_KEY, storedValue);
  }

  fetchStoredColNum(): number | null {
    const storedValue = localStorage.getItem(NUM_COLS_LOCAL_STORAGE_KEY);
    if (storedValue) {
      try {
        const value = JSON.parse(storedValue);
        return value;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    return null;
  }

  setNumberOfCols(cols: number) {
    this.numberOfCols$.next(cols);
  }

  setFileName(name: string) {
    localStorage.setItem(FILE_NAME_KEY, name);
  }

  getLastFileName() {
    return localStorage.getItem(FILE_NAME_KEY);
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
