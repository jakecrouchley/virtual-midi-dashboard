import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
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

  @ViewChild('knobIndicator') knobIndicator?: ElementRef;

  currentRotation$ = new BehaviorSubject(0);

  cellSideLength = cellSideLength;

  // Drag Event Vars
  acceptInput = true;
  previousX?: number;
  previousY?: number;

  constructor(
    private midiService: MidiService,
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentRotation$.subscribe((rotation) => {
      console.log(rotation);
      console.log(this.knobIndicator);

      if (this.knobIndicator) {
        this.knobIndicator.nativeElement.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
      }
    });
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

  onCellMouseDrag(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.acceptInput) {
      this.acceptInput = false;
      this.calculateRotationFromEvent(event);
      setTimeout(() => {
        this.acceptInput = true;
      }, 1);
    }

    // console.log('x: ', event.x);
    // console.log('y: ', event.y);
    // console.log('clientX: ', event.clientX);
    // console.log('clientY: ', event.clientY);
    // console.log('pageX: ', event.pageX);
    // console.log('pageY: ', event.pageY);
  }

  calculateRotationFromEvent(event: DragEvent) {
    if (this.previousY) {
      // const diffY =
      if (this.previousY > event.clientY) {
        this.currentRotation$.next(this.currentRotation$.value + 1);
      } else if (this.previousY < event.clientY) {
        this.currentRotation$.next(this.currentRotation$.value - 1);
      }
    }
    this.previousY = event.clientY;
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
