import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService, ICell } from 'src/app/services/data.service';

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
  });

  constructor(private fb: FormBuilder, private dataService: DataService) {}

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
}
