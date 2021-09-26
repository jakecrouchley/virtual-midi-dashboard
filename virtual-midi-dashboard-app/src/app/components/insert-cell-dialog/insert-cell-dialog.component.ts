import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { matIconList } from './icon-list';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CELL_TYPES, ICell } from '../../../../../common';

export interface IconGroup {
  group: string;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().indexOf(filterValue) === 0);
};

@Component({
  selector: 'app-insert-cell-dialog',
  templateUrl: './insert-cell-dialog.component.html',
  styleUrls: ['./insert-cell-dialog.component.scss'],
})
export class InsertCellDialogComponent implements OnInit {
  newCellForm = this.fb.group({
    cellType: [CELL_TYPES[0], Validators.required],
    label: [''],
    type: ['midi', Validators.required],
    note: ['', Validators.required],
    velocity: [127, Validators.required],
    controller: [''],
    value: [127],
    iconName: [''],
    index: [0],
  });

  CELL_TYPES = CELL_TYPES;

  matIconList: IconGroup[] = matIconList;
  matIconList$: Observable<IconGroup[]>;

  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { index: number; cell?: ICell }
  ) {
    if (data.cell) {
      this.isEditMode = true;
      this.newCellForm.setValue(data.cell);
    }

    const recentlyUsedIcons = this.dataService.getRecentlyUsedIconList();
    const recentlyUsedIconsGroup = {
      group: 'Recently Used',
      names: [...recentlyUsedIcons],
    };
    this.matIconList = [recentlyUsedIconsGroup, ...this.matIconList];

    this.newCellForm.get('index')?.setValue(data.index);
    const iconNameControl = this.newCellForm.get('iconName');
    if (iconNameControl) {
      this.matIconList$ = iconNameControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterGroup(value))
      );
    } else {
      this.matIconList$ = of([]);
    }
  }

  ngOnInit(): void {
    this.newCellForm.get('type')?.valueChanges.subscribe((val) => {
      if (val === 'midi') {
        this.newCellForm.controls.note.setValidators([Validators.required]);
        this.newCellForm.controls.velocity.setValidators([Validators.required]);
        this.newCellForm.controls.controller.clearValidators();
        this.newCellForm.controls.value.clearValidators();
      } else {
        this.newCellForm.controls.controller.setValidators([
          Validators.required,
        ]);
        this.newCellForm.controls.value.setValidators([Validators.required]);
        this.newCellForm.controls.note.clearValidators();
        this.newCellForm.controls.velocity.clearValidators();
      }
      this.newCellForm.controls.controller.updateValueAndValidity();
      this.newCellForm.controls.value.updateValueAndValidity();
      this.newCellForm.controls.note.updateValueAndValidity();
      this.newCellForm.controls.velocity.updateValueAndValidity();
    });
  }

  private _filterGroup(value: string): IconGroup[] {
    if (value) {
      return this.matIconList
        .map((group) => ({
          group: group.group,
          names: _filter(group.names, value),
        }))
        .filter((group) => group.names.length > 0);
    }

    return this.matIconList;
  }
}
