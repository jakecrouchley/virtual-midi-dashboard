import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import { ICell, IMIDICell, ICCCell, DATA_VERSION } from '../../../../../common';
import { MidiService } from 'src/app/services/midi.service';
import { InsertCellDialogComponent } from '../insert-cell-dialog/insert-cell-dialog.component';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CellComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() cell!: ICell;
  @Input() index!: number;
  @Input() cellEdgeLength!: number;

  constructor(
    private midiService: MidiService,
    private dataService: DataService,
    private dialog: MatDialog,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

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

  // onKnobCellMousedown(event: MouseEvent) {
  //   // event.preventDefault();
  // }

  // onCellMouseDragStart(event: DragEvent) {
  //   this.$onDragStart.next(event);
  // }

  // onCellMouseDragEnd(event: DragEvent) {
  //   this.$onDragEnd.next(event);
  // }

  // onCellMouseDrag(event: DragEvent) {
  //   this.$onDrag.next(event);
  // }

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

    dialogRef.afterClosed().subscribe((result: ICell) => {
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
