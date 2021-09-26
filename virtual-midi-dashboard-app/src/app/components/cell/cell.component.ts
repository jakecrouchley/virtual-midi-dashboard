import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { cellSideLength } from 'src/app/app.component';
import { DataService } from 'src/app/services/data.service';
import { ICell, IMIDICell, ICCCell, DATA_VERSION } from '../../../../../common';
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
      switch (this.cell.type) {
        case 'midi':
          this.midiService.sendMidiNoteOn(this.cell as IMIDICell);
          break;
        case 'cc':
          this.midiService.sendCC(this.cell as ICCCell);
          break;
        default:
          this.midiService.sendMidiNoteOn(this.cell as IMIDICell);
      }
    } else if (event.button === 2) {
      this.openDialog();
    } else {
      this.openDialog();
    }
  }

  onCellMouseup() {
    if (this.cell) {
      switch (this.cell.type) {
        case 'midi':
          this.midiService.sendMidiNoteOff(this.cell as IMIDICell);
          break;
        case 'cc':
          // TODO: Build this in
          break;
        default:
          this.midiService.sendMidiNoteOff(this.cell as IMIDICell);
      }
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
        cell.version = DATA_VERSION;
        this.dataService.addCell(cell);
        this.dataService.addIconToRecentlyUsedList(cell.iconName);
      }
    });
  }
}
