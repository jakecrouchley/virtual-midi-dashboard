import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import { ICell, IMIDICell, ICCCell, DATA_VERSION } from '../../../../../common';
import { MidiService } from 'src/app/services/midi.service';
import { InsertCellDialogComponent } from '../insert-cell-dialog/insert-cell-dialog.component';
import { fromEvent, Observable } from 'rxjs';

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

  @ViewChild('cellRef') cellRef?: ElementRef<HTMLDivElement>;

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
          this.openDialog();
        }
      });
    }
  }

  onCellMousedown(event: MouseEvent) {
    if (event.button === 2) {
      this.openDialog();
    } else {
      this.openDialog();
    }
  }

  onMidiValueReceived(value: number) {
    if (this.cell.type === 'midi') {
      const updatedCell: IMIDICell = {
        ...(this.cell as IMIDICell),
        velocity: value,
      };
      this.cell = updatedCell;
      this.changeRef.detectChanges();
      this.dataService.replaceCell(updatedCell);

      this.midiService.sendMidiNoteOn(this.cell as IMIDICell);
    } else if (this.cell.type === 'cc') {
      const updatedCell: ICCCell = {
        ...(this.cell as ICCCell),
        value,
      };
      this.cell = updatedCell;
      this.changeRef.detectChanges();
      this.dataService.replaceCell(updatedCell);

      this.midiService.sendCC(this.cell as ICCCell);
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
      return `${midiCell.note}`;
    } else {
      const ccCell = this.cell as ICCCell;
      return `${ccCell.controller}`;
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
