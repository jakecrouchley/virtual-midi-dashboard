import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  BehaviorSubject,
  fromEvent,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { cellSideLength } from 'src/app/app.component';
import { DataService } from 'src/app/services/data.service';
import { ICell, IMIDICell, ICCCell, DATA_VERSION } from '../../../../../common';
import { MidiService } from 'src/app/services/midi.service';
import { InsertCellDialogComponent } from '../insert-cell-dialog/insert-cell-dialog.component';
import { debounce, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent implements OnInit, AfterViewInit {
  @Input() cell!: ICell;
  @Input() index!: number;

  @ViewChild('knob') knob?: ElementRef<HTMLDivElement>;
  @ViewChild('knobIndicator') knobIndicator?: ElementRef;
  @ViewChild('dragIndicator') dragIndicator?: ElementRef<HTMLSpanElement>;

  currentRotation$ = new BehaviorSubject(0);

  // Event Observables
  $onDragStart?: Observable<DragEvent>;
  $onDrag?: Observable<DragEvent>;
  $onDragEnd?: Observable<DragEvent>;

  cellSideLength = cellSideLength;

  // Drag Event Vars
  startX = 0;
  startY = 0;

  constructor(
    private midiService: MidiService,
    private dataService: DataService,
    private dialog: MatDialog,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.currentRotation$.subscribe((rotation) => {
      if (this.knobIndicator) {
        this.knobIndicator.nativeElement.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
      }
    });

    if (this.knob) {
      this.$onDragStart = fromEvent<DragEvent>(
        this.knob?.nativeElement,
        'dragstart'
      );
      this.$onDragStart.subscribe((event) => {
        console.log('drag started');
        const img = new Image();
        img.src =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        if (event.dataTransfer) {
          event.dataTransfer.setDragImage(img, 0, 0);
        }
        this.startX = event.clientX;
        this.startY = event.clientY;
        if (this.dragIndicator) {
          this.dragIndicator.nativeElement.style.display = 'block';
          this.dragIndicator.nativeElement.style.top = `${
            event.clientY - 10
          }px`;
          this.dragIndicator.nativeElement.style.left = `${
            event.clientX - 10
          }px`;
        }
      });

      this.$onDrag = fromEvent<DragEvent>(this.knob?.nativeElement, 'drag');
      this.$onDrag.subscribe((event) => {
        console.log(event);
        this.calculateRotationFromEvent(event);
      });

      this.$onDragEnd = fromEvent<DragEvent>(
        this.knob?.nativeElement,
        'dragend'
      );
      this.$onDragEnd.subscribe((event) => {
        this.startX = 0;
        this.startY = 0;
        if (this.dragIndicator) {
          this.dragIndicator.nativeElement.style.display = 'none';
        }
      });
    }
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

  calculateRotationFromEvent(event: DragEvent) {
    const stepValue = event.clientY - this.startY;
    this.currentRotation$.next(this.currentRotation$.value + stepValue / 50);
    // if (this.previousY) {
    //   // const diffY =
    //   if (this.previousY > event.clientY) {
    //     this.currentRotation$.next(this.currentRotation$.value + 1);
    //   } else if (this.previousY < event.clientY) {
    //     this.currentRotation$.next(this.currentRotation$.value - 1);
    //   }
    // }
    // this.previousY = event.clientY;
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
