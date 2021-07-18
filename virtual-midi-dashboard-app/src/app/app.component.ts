import { Overlay } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CELL_LOCAL_STORAGE_KEY,
  DataService,
  ICell,
} from './services/data.service';

export const NUM_ROWS = 3;
// Cell edge length = (window - navbar height and padding) / desired no. of rows
export const cellSideLength = (window.innerHeight - 34) / NUM_ROWS;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('confirmNewDialog') confirmNewDialog!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  defaultGridCount = 12; // Dynamic option: Math.floor(window.innerWidth / this.cellSideLength) * this.NUM_ROWS;

  cells: ICell[] = [];
  cellSideLength = cellSideLength;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private overlay: Overlay
  ) {
    this.overlay.create();
  }

  ngOnInit() {
    this.dataService.cells$.subscribe((cells) => {
      let startingGridSize = this.defaultGridCount;
      cells.forEach((cell) => {
        startingGridSize = Math.max(
          isNaN(cell.index + 1) ? 0 : cell.index + 1,
          startingGridSize
        );
      });

      this.cells = new Array(startingGridSize);
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
    reader.addEventListener('load', (event) => {
      if (event.target && event.target?.result) {
        this.validateAndLoadFileContent(event.target.result as string);
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
      (fileJSON as Object[]).forEach((cell) => {
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
