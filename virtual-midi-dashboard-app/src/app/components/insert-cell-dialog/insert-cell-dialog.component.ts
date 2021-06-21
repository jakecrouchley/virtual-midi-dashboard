import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DataService, ICell } from 'src/app/services/data.service';
import { matIconList } from './icon-list';
import { map, startWith } from 'rxjs/operators';

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
    type: ['midi', Validators.required],
    note: ['', Validators.required],
    velocity: [127, Validators.required],
    controller: [''],
    value: [127],
    iconName: [''],
  });

  matIconList: IconGroup[] = matIconList;
  matIconList$: Observable<IconGroup[]>;

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.matIconList$ = this.newCellForm.get('iconName')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterGroup(value))
    );
  }

  ngOnInit(): void {
    this.newCellForm.get('type')!.valueChanges.subscribe((val) => {
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
