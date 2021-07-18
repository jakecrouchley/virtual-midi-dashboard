import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { cellSideLength } from 'src/app/app.component';
import {
  DataService,
  ICCCell,
  ICell,
  IMIDICell,
} from 'src/app/services/data.service';
import { MidiService } from 'src/app/services/midi.service';
import { InsertCellDialogComponent } from '../insert-cell-dialog/insert-cell-dialog.component';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent implements OnInit {
  @Input() cell!: ICell;
  @Input() index!: number;

  cellSideLength = cellSideLength;

  constructor(
    private midiService: MidiService,
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  onCellMousedown(event: MouseEvent) {
    event.preventDefault();
    if (this.cell && event.button !== 2) {
      let cellAction;

      switch (this.cell.type) {
        case 'midi':
          cellAction = this.midiService.sendMidiNoteOn(this.cell as IMIDICell);
          break;
        case 'cc':
          cellAction = this.midiService.sendCC(this.cell as ICCCell);
          break;
        default:
          cellAction = this.midiService.sendMidiNoteOn(this.cell as IMIDICell);
      }
      cellAction.subscribe((_) => {});
    } else if (event.button === 2) {
      this.openDialog();
    } else {
      this.openDialog();
    }
  }

  onCellMouseup() {
    if (this.cell) {
      let cellAction;
      switch (this.cell.type) {
        case 'midi':
          cellAction = this.midiService.sendMidiNoteOff(this.cell as IMIDICell);
          break;
        case 'cc':
          cellAction = of('');
          break;
        default:
          cellAction = this.midiService.sendMidiNoteOff(this.cell as IMIDICell);
      }
      cellAction.subscribe((_) => {});
    }
  }

  onCellContextMenu(event: Event) {
    event.preventDefault();
  }

  getCellInfoText() {
    if (this.cell.type === 'midi') {
      const midiCell = this.cell as IMIDICell;
      return `${midiCell.note}, ${midiCell.velocity}`;
    } else {
      const ccCell = this.cell as ICCCell;
      return `${ccCell.controller}, ${ccCell.value}`;
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(InsertCellDialogComponent, {
      data: {
        index: this.index,
        cell: this.cell,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: `, result);
      if (result) {
        const cell = result as ICell;
        this.dataService.addCell(cell);
        this.dataService.addIconToRecentlyUsedList(cell.iconName);
      }
    });
  }
}
