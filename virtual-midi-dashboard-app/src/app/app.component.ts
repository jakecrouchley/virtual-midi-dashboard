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
import { Observable, of } from 'rxjs';
import { InsertCellDialogComponent } from './components/insert-cell-dialog/insert-cell-dialog.component';
import {
  CELL_LOCAL_STORAGE_KEY,
  DataService,
  ICCCell,
  ICell,
  IMIDICell,
} from './services/data.service';
import { MidiService } from './services/midi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('confirmNewDialog') confirmNewDialog!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  NUM_ROWS = 3;

  // Cell edge length = (window - navbar height and padding) / desired no. of rows
  cellSideLength = (window.innerHeight - 34) / this.NUM_ROWS;
  defaultGridCount = 12; // Dynamic option: Math.floor(window.innerWidth / this.cellSideLength) * this.NUM_ROWS;

  cells: ICell[] = [];

  constructor(
    private dataService: DataService,
    private midiService: MidiService,
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

  onCellMousedown(event: MouseEvent, cell?: ICell, index?: number) {
    event.preventDefault();
    if (cell && event.button !== 2) {
      let cellAction;
      switch (cell.type) {
        case 'midi':
          cellAction = this.midiService.sendMidiNoteOn(cell as IMIDICell);
          break;
        case 'cc':
          cellAction = this.midiService.sendCC(cell as ICCCell);
          break;
        default:
          cellAction = this.midiService.sendMidiNoteOn(cell as IMIDICell);
      }
      cellAction.subscribe((_) => {});
    } else if (event.button === 2) {
      this.openDialog(index, cell);
    } else {
      this.openDialog(index);
    }
  }

  onCellMouseup(cell?: ICell, index?: number) {
    if (cell) {
      let cellAction;
      switch (cell.type) {
        case 'midi':
          cellAction = this.midiService.sendMidiNoteOff(cell as IMIDICell);
          break;
        case 'cc':
          cellAction = of('');
          break;
        default:
          cellAction = this.midiService.sendMidiNoteOff(cell as IMIDICell);
      }
      cellAction.subscribe((_) => {});
    }
  }

  onCellContextMenu(event: Event) {
    event.preventDefault();
  }

  getCellInfoText(cell: ICell) {
    if (cell.type === 'midi') {
      const midiCell = cell as IMIDICell;
      return `${midiCell.note}, ${midiCell.velocity}`;
    } else {
      const ccCell = cell as ICCCell;
      return `${ccCell.controller}, ${ccCell.value}`;
    }
  }

  openDialog(atIndex?: number, withCell?: ICell) {
    const dialogRef = this.dialog.open(InsertCellDialogComponent, {
      data: {
        index: atIndex ?? 0,
        cell: withCell,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        const cell = result as ICell;
        this.dataService.addCell(cell);
        this.dataService.addIconToRecentlyUsedList(cell.iconName);
      }
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
