import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import {
  ICell,
  IMIDICell,
  ICCCell,
  DATA_VERSION,
  ICCEvent,
  IMIDIEvent,
  IInputEvent,
} from '../../../../../common';
import { MidiService } from 'src/app/services/midi.service';
import { InsertCellDialogComponent } from '../insert-cell-dialog/insert-cell-dialog.component';
import { fromEvent, Observable } from 'rxjs';
import { NewCellFormComponent } from '../new-cell-form/new-cell-form.component';

export type ControlValue = { action: 'on' | 'off'; value: number };
@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CellComponent implements OnInit, AfterViewInit {
  @Input() cell!: ICell;
  @Input() index!: number;
  @Input() cellEdgeLength!: number;

  @Output() newCellFormActivated = new EventEmitter<number>();

  @ViewChild('cellRef') cellRef?: ElementRef<HTMLDivElement>;
  @ViewChild('newCellForm') newCellForm!: NewCellFormComponent;

  private _showNewCellForm = false;
  get showNewCellForm() {
    return this._showNewCellForm;
  }
  set showNewCellForm(value: boolean) {
    if (value) {
      this._showNewCellForm = value;
      this.newCellFormActivated.emit(this.index);
    } else {
      if (!this.newCellForm.isFormStarted || this.cell) {
        this._showNewCellForm = value;
      }
    }
  }

  $onCellMousedown?: Observable<MouseEvent>;

  constructor(
    private midiService: MidiService,
    private dataService: DataService,
    private dialog: MatDialog,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.cellRef) {
      this.$onCellMousedown = fromEvent<MouseEvent>(
        this.cellRef.nativeElement,
        'mousedown'
      );
      this.$onCellMousedown.subscribe((event) => {
        if (event.button === 2) {
          event.preventDefault();
          // this.openDialog();
          this.showNewCellForm = true;
        }
      });
    }
  }

  onCellMousedown(event: MouseEvent) {
    this.showNewCellForm = true;
  }

  onCellMouseOver(event: MouseEvent) {
    this.showNewCellForm = true;
  }
  onCellMouseLeave(event: MouseEvent) {
    this.showNewCellForm = false;
  }

  onControlValueReceived(value: ControlValue) {
    console.log('value sent: ', value);

    if (this.cell.type === 'midi') {
      const midiEvent: IMIDIEvent = {
        cell: this.cell as IMIDICell,
        action: value.action,
        velocity: value.value,
      };
      this.midiService.sendMidiNote(midiEvent);
    } else if (this.cell.type === 'cc') {
      const ccEvent: ICCEvent = {
        cell: this.cell as ICCCell,
        action: value.action,
        value: value.value,
      };
      this.midiService.sendCC(ccEvent);
    }
  }

  onInputValueReceived(event: IInputEvent) {
    console.log(this.index);
    console.log(event);
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
      return `${midiCell.note}`;
    } else {
      const ccCell = this.cell as ICCCell;
      return `${ccCell.controller}`;
    }
  }

  // openDialog() {
  //   const dialogRef = this.dialog.open(InsertCellDialogComponent, {
  //     data: {
  //       index: this.index,
  //       cell: this.cell,
  //     },
  //   });

  //   dialogRef.afterClosed().subscribe((result: ICell) => {
  //     console.log(`Dialog result: `, result);
  //     if (result) {
  //       const cell = result as ICell;
  //       cell.version = DATA_VERSION;
  //       this.dataService.addCell(cell);
  //       this.dataService.addIconToRecentlyUsedList(cell.iconName);
  //     }
  //   });
  // }
}
