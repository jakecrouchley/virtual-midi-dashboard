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
import { fromEvent, Observable } from 'rxjs';

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
  @Input() sustain?: boolean;

  @Output() midiSend: EventEmitter<number> = new EventEmitter();

  @ViewChild('button') button?: ElementRef<HTMLDivElement>;

  $onMouseDown?: Observable<MouseEvent>;
  $onMouseUp?: Observable<MouseEvent>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.button) {
      this.$onMouseDown = fromEvent<MouseEvent>(
        this.button?.nativeElement,
        'mousedown'
      );
      this.$onMouseDown.subscribe((event) => {
        console.log(event);
        if (event.button === 0) {
          this.midiSend.emit(127);
        }
      });

      this.$onMouseUp = fromEvent<MouseEvent>(
        this.button?.nativeElement,
        'mouseup'
      );
      this.$onMouseUp.subscribe((event) => {
        console.log(this.sustain);
        if (!this.sustain) {
          this.midiSend.emit(0);
        }
      });
    }
  }
}
