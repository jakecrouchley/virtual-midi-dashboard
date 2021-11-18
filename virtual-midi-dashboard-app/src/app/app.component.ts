import { Overlay } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { DATA_VERSION, ICell } from '../../../common';
import { CELL_LOCAL_STORAGE_KEY, DataService } from './services/data.service';

// export let NUM_ROWS = 3;
// Cell edge length = (window - navbar height and padding) / desired no. of rows
// export const cellEdgeLength = (window.innerHeight - 34) / NUM_ROWS;
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

  cells: ICell[] = [];
  cellEdgeLength = cellEdgeLength;
  NUM_COLS = 4;
  NUM_ROWS = 0;
  gridTemplateCols = `repeat(${this.NUM_COLS}, ${cellEdgeLength})`;

  dataVersion = DATA_VERSION;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private overlay: Overlay,
    private changeRef: ChangeDetectorRef
  ) {
    this.overlay.create();
  }

  ngOnInit() {
    // this.dataService.cells$.subscribe((cells) => {
    //   let startingGridSize = this.defaultGridCount;
    //   cells.forEach((cell) => {
    //     startingGridSize = Math.max(
    //       isNaN(cell.index + 1) ? 0 : cell.index + 1,
    //       startingGridSize
    //     );
    //   });
    //   this.cells = new Array(startingGridSize);
    //   cells.forEach((cell) => {
    //     this.cells[cell.index] = cell;
    //   });
    // });
    this.cells = new Array(gridSize);
    this.dataService.cells$.subscribe((cells) => {
      cells.forEach((cell) => {
        this.cells[cell.index] = cell;
      });
    });
  }

  ngAfterViewInit() {
    // This stops the right click event from triggering the context menu
    const overlay = document
      .getElementsByClassName('cdk-overlay-container')
      .item(0) as HTMLElement;
    overlay.oncontextmenu = (event) => {
      event.preventDefault();
    };

    this.NUM_COLS = Math.floor(window.innerWidth / cellEdgeLength);

    fromEvent(window, 'resize').subscribe((event) => {
      // console.log(event);
      this.calculateGridDimensions();
      this.populateCells();
    });
    this.calculateGridDimensions();
    this.populateCells();
  }

  calculateGridDimensions() {
    console.log('updating dimensions');

    cellEdgeLength = window.innerWidth / this.NUM_COLS;
    if (cellEdgeLength > maxCellEdgeLength) {
      this.NUM_COLS += 1;
    } else if (cellEdgeLength < minCellEdgeLength) {
      this.NUM_COLS -= 1;
    }
    this.NUM_ROWS = Math.floor((window.innerHeight - 34) / cellEdgeLength);
    gridSize = this.NUM_COLS * this.NUM_ROWS;

    // Update local variable with value of exported variable
    this.cellEdgeLength = cellEdgeLength;

    this.cellContainer.nativeElement.style.gridTemplateColumns = `repeat(${this.NUM_COLS}, ${cellEdgeLength}px)`;
    this.cellContainer.nativeElement.style.gridTemplateRows = `repeat(${this.NUM_ROWS}, ${cellEdgeLength}px)`;

    this.changeRef.detectChanges();
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
          this.cells = new Array(this.cells.length);
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

  handleFileInput(event: any) {
    const file = event.target.files[0] as File;
    const reader = new FileReader();
    reader.addEventListener('load', (loadEvent) => {
      if (loadEvent.target && loadEvent.target?.result) {
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
