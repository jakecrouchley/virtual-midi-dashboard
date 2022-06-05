import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { CELL_TYPES, DATA_VERSION, ICell } from '../../../../../common';

@Component({
  selector: 'app-new-cell-form',
  templateUrl: './new-cell-form.component.html',
  styleUrls: ['./new-cell-form.component.scss'],
})
export class NewCellFormComponent implements OnInit, OnDestroy {
  @Input() showForm = false;
  @Input() index!: number;
  @Input() cell?: ICell;
  @Output() showFormChange = new EventEmitter<boolean>();

  isFormStarted = false;

  destroy$ = new Subject<boolean>();

  currentPage = 0;
  pageCount = 2;

  newCellForm = this.getForm();

  constructor(private fb: FormBuilder, private dataService: DataService) {}

  ngOnInit(): void {
    this.initialise();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  initialise(): void {
    this.newCellForm = this.getForm();
    this.isFormStarted = false;
    this.currentPage = 0;

    if (this.cell) {
      this.isFormStarted = true;
      // Pull non-form values out of cell data
      const { version, ...cellValues } = this.cell;
      this.newCellForm.setValue(cellValues);
    }
    this.newCellForm.controls.index.setValue(this.index);
    this.newCellForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((values) => {
        this.isFormStarted = values.cellType !== null;
      });
  }

  getForm(): FormGroup {
    return this.fb.group({
      cellType: [null, Validators.required],
      label: [''],
      type: [null, Validators.required],
      note: [null, Validators.required],
      velocity: [127, Validators.required],
      sustain: [false],
      controller: [''],
      value: [127],
      iconName: [''],
      index: [0],
    });
  }

  onMouseLeave(event: MouseEvent): void {
    if (!this.isFormStarted) {
      this.showFormChange.emit(false);
    }
  }

  enableNextPageButton(): boolean {
    if (this.currentPage === 0) {
      return this.newCellForm.value.cellType !== null;
    } else if (this.currentPage === 1) {
      return this.newCellForm.value.type !== null;
    } else {
      return this.currentPage !== this.pageCount;
    }
  }

  onNextPageClicked(): void {
    this.currentPage = Math.max(
      0,
      Math.min(this.pageCount, this.currentPage + 1)
    );
  }

  enablePreviousPageButton(): boolean {
    return this.currentPage !== 0;
  }

  onPreviousPageClicked(): void {
    this.currentPage = Math.max(
      0,
      Math.min(this.pageCount, this.currentPage - 1)
    );
  }

  onCloseFormPressed(): void {
    if (!this.cell) {
      this.isFormStarted = false;
    }
    this.showFormChange.emit(false);
  }

  onClearFormPressed(): void {
    if (this.cell) {
      this.dataService.removeCell(this.index);
    }
    this.initialise();
    this.showFormChange.emit(false);
  }

  controlTypeSelected(controlType: string) {
    this.newCellForm.controls.cellType.setValue(controlType);
    this.onNextPageClicked();
  }

  typeSelected(type: string) {
    this.newCellForm.controls.type.setValue(type);
    this.onNextPageClicked();
  }

  onSubmit() {
    // Update the index in case more cells have been added since
    this.newCellForm.controls.index.setValue(this.index);
    const cell = this.newCellForm.value as ICell;
    cell.version = DATA_VERSION;
    this.dataService.addCell(cell);
    this.initialise();
    this.showFormChange.emit(false);
  }
}
