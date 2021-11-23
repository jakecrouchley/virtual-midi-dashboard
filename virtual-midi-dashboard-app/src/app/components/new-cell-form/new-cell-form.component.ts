import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-new-cell-form',
  templateUrl: './new-cell-form.component.html',
  styleUrls: ['./new-cell-form.component.scss'],
})
export class NewCellFormComponent implements OnInit {
  @Input() showForm = false;
  @Output() showFormChange = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit(): void {}

  onMouseLeave(event: MouseEvent) {
    this.showFormChange.emit(false);
  }
}
