import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { ControlValue } from '../cell.component';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit, AfterViewInit {
  @Input() iconName!: string;
  @Input() label!: string;
  @Input() type!: string;
  @Input() info!: string;

  @Output() midiSend: EventEmitter<ControlValue> = new EventEmitter();

  @ViewChild('button') button?: ElementRef<HTMLDivElement>;

  $onMouseDown?: Observable<MouseEvent>;
  $onMouseLeave?: Observable<MouseEvent>;
  $onMouseUp?: Observable<MouseEvent>;

  isBeingPressed = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.button) {
      this.button!.nativeElement.ondragstart = (event) => false;
      this.$onMouseDown = fromEvent<MouseEvent>(
        this.button?.nativeElement,
        'mousedown'
      );
      this.$onMouseDown.subscribe((event) => {
        if (event.button === 0) {
          this.midiSend.emit({
            action: 'on',
            value: 127,
          });
          this.isBeingPressed = true;
        }
      });

      this.$onMouseUp = fromEvent<MouseEvent>(
        this.button?.nativeElement,
        'mouseup'
      );
      this.$onMouseLeave = fromEvent<MouseEvent>(
        this.button?.nativeElement,
        'mouseout'
      );
      merge(this.$onMouseUp, this.$onMouseLeave).subscribe((event) => {
        this.midiSend.emit({
          action: 'off',
          value: 127,
        });
        this.isBeingPressed = false;
      });
    }
  }
}
