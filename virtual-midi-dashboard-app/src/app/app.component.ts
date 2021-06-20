import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { InsertCellDialogComponent } from './components/insert-cell-dialog/insert-cell-dialog.component';
import {
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
export class AppComponent implements OnInit {
  NUM_ROWS = 3;

  cellSideLength = window.innerHeight / this.NUM_ROWS;

  cells: ICell[] = [];

  constructor(
    private dataService: DataService,
    private midiService: MidiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataService.getCells().subscribe((cells) => {
      this.cells = cells;
    });
  }

  // appendNewCell() {
  //   this.dataService.appendCell({
  //     note: 64,
  //     velocity: 127,
  //     label: 'Test',
  //     event: 'noteon',
  //   });
  // }

  performCellAction(cell: ICell) {
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

  openDialog() {
    const dialogRef = this.dialog.open(InsertCellDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        const cell = result as ICell;
        this.dataService.appendCell(cell);
      }
    });
  }
}
