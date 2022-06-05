import { Overlay } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Note } from 'easymidi';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  CELL_TYPES,
  DATA_VERSION,
  ICell,
  IMIDICell,
  IMIDIEvent,
} from '../../../common';
import { CellComponent } from './components/cell/cell.component';
import { CELL_LOCAL_STORAGE_KEY, DataService } from './services/data.service';
import { MidiService } from './services/midi.service';

export let cellEdgeLength = 200;
export const minCellEdgeLength = 150;
export const maxCellEdgeLength = 250;

export let gridSize = 12;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('confirmNewDialog') confirmNewDialog!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cellContainer') cellContainer!: ElementRef<HTMLElement>;

  @ViewChildren('cell') cellElements!: QueryList<CellComponent>;

  cells: ICell[] = [];
  cellEdgeLength = cellEdgeLength;
  NUM_COLS = 4;
  NUM_ROWS = 0;
  gridTemplateCols = `repeat(${this.NUM_COLS}, ${cellEdgeLength})`;

  fileName: string | null = null;

  dataVersion = DATA_VERSION;

  constructor(
    private dataService: DataService,
    private midiService: MidiService,
    private dialog: MatDialog,
    private overlay: Overlay
  ) {
    this.overlay.create();
  }

  ngOnInit() {
    this.cells = new Array(gridSize);
    this.dataService.cells$.subscribe((cells) => {
      this.cells = new Array(gridSize);
      cells.forEach((cell) => {
        this.cells[cell.index] = cell;
        console.log('cells updated');
      });
    });

    this.dataService.numberOfCols$.subscribe((value) => {
      if (value) {
        this.NUM_COLS = value;
        this.calculateGridDimensions();
        this.populateCells();
      } else {
        this.dataService.setNumberOfCols(
          Math.floor(window.innerWidth / cellEdgeLength)
        );
      }
    });

    fromEvent(window, 'resize').subscribe((event) => {
      // console.log(event);
      this.calculateGridDimensions();
      this.populateCells();
    });
    fromEvent(window, 'DOMContentLoaded').subscribe((event) => {
      console.log('DOM Loaded');
      this.calculateGridDimensions();
      this.populateCells();
    });

    this.midiService.incomingMessages$.subscribe((event) => {
      console.log('incoming event: ', event);

      this.cellElements.forEach((component) => {
        if (
          component.cell &&
          event.type === 'noteon' &&
          component.cell.type === 'midi'
        ) {
          if (
            +(component.cell as IMIDICell).note ===
            +(event.payload as Note).note
          ) {
            component.onInputValueReceived(event);
          }
        }
      });
    });

    this.fileName = this.dataService.getLastFileName();
  }

  ngAfterViewInit() {
    // This stops the right click event from triggering the context menu
    const overlay = document
      .getElementsByClassName('cdk-overlay-container')
      .item(0) as HTMLElement;
    overlay.oncontextmenu = (event) => {
      event.preventDefault();
    };
  }

  calculateGridDimensions() {
    console.log('updating dimensions');

    cellEdgeLength = window.innerWidth / this.NUM_COLS;
    if (cellEdgeLength > maxCellEdgeLength) {
      this.dataService.setNumberOfCols(this.NUM_COLS + 1);
    } else if (cellEdgeLength < minCellEdgeLength) {
      this.dataService.setNumberOfCols(this.NUM_COLS - 1);
    }
    this.NUM_ROWS = Math.floor((window.innerHeight - 34) / cellEdgeLength);
    gridSize = this.NUM_COLS * this.NUM_ROWS;

    // Update local variable with value of exported variable
    this.cellEdgeLength = cellEdgeLength;
    if (this.cellContainer?.nativeElement) {
      this.cellContainer.nativeElement.style.gridTemplateColumns = `repeat(${this.NUM_COLS}, ${cellEdgeLength}px)`;
      this.cellContainer.nativeElement.style.gridTemplateRows = `repeat(${this.NUM_ROWS}, ${cellEdgeLength}px)`;
    }
  }

  decreaseCols() {
    this.dataService.setNumberOfCols(this.NUM_COLS - 1);
  }

  increaseCols() {
    this.dataService.setNumberOfCols(this.NUM_COLS + 1);
  }

  populateCells() {
    // Calculate number of cells to fit grid
    this.cells = new Array(gridSize);
    this.dataService.cells$.pipe(take(1)).subscribe((cells) => {
      cells.forEach((cell) => {
        this.cells[cell.index] = cell;
      });
    });
  }

  // Menu Actions

  onNewClicked() {
    if (this.cells.filter((cell) => cell !== null).length > 0) {
      const dialogRef = this.dialog.open(this.confirmNewDialog);
      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          console.log('Confirmed new');
          this.cells = new Array(gridSize);
          this.dataService.cells$.next([]);
          localStorage.removeItem(CELL_LOCAL_STORAGE_KEY);
        }
      });
    }
  }

  onDownloadClicked() {
    const storedCells = this.dataService.fetchStoredCells();
    if (storedCells) {
      // Create element and trigger download action
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(storedCells));
      const aElement = document.createElement('a');
      if (aElement) {
        aElement.setAttribute('href', dataStr);
        aElement.setAttribute('download', 'midi-dashboard-export.json');
        aElement.click();
        aElement.remove();
      }
    } else {
    }
  }

  onLoadClicked() {}

  onNewCellFormActivated(index: number) {
    this.cellElements.forEach((cellComponent) => {
      if (cellComponent.index !== index) {
        cellComponent.showNewCellForm = false;
      }
    });
  }

  handleFileInput(event: any) {
    const file = event.target.files[0] as File;
    const reader = new FileReader();
    reader.addEventListener('load', (loadEvent) => {
      if (loadEvent.target && loadEvent.target?.result) {
        this.dataService.setFileName(file.name);
        this.fileName = this.dataService.getLastFileName();
        this.validateAndLoadFileContent(loadEvent.target.result as string);
        this.fileInput.nativeElement.value = '';
      } else {
        console.error('No file');
      }
    });
    reader.readAsText(file);
  }

  /**
   * Validate the file structure and if valid then load the file into the cells object
   * @param fileText JSON file as a text string structured in accordance with the ICell format
   */
  validateAndLoadFileContent(fileText: string) {
    try {
      const fileJSON = JSON.parse(fileText);
      // Assume valid and then mark invalid if any item doesn't have a note or controller set
      let validated = true;
      (fileJSON as object[]).forEach((cell) => {
        if (
          !cell.hasOwnProperty('note') &&
          !cell.hasOwnProperty('controller')
        ) {
          validated = false;
        }
      });
      if (validated) {
        this.dataService.setCells(fileJSON as ICell[]);
      } else {
        throw new Error('File not in valid format.');
      }
    } catch (error) {
      console.error('Error parsing file JSON.');
      // TODO: Handle file upload error
    }
  }
}
