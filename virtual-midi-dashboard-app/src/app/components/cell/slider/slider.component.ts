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
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MIDIEvent } from '../../../../../../common';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit, AfterViewInit {
  @Input() label!: string;
  @Input() type!: string;
  @Input() info!: string;

  @ViewChild('slider') slider?: ElementRef<HTMLSpanElement>;
  @ViewChild('sliderHandle') sliderHandle?: ElementRef<HTMLSpanElement>;

  @Output() midiSend: EventEmitter<number> = new EventEmitter();

  // Drag Event Vars
  startX = 0;
  startY = 0;
  previousValue = 0;
  isMouseDown = false;
  dragHoldInterval: any;

  sliderHandleOffset = 0.708;

  // -1 to 1
  currentValue$ = new BehaviorSubject(-1);

  // Event Observables
  $onDragStart?: Observable<MouseEvent>;
  $onDrag?: Observable<MouseEvent>;
  $onDragEnd?: Observable<MouseEvent>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.currentValue$.pipe(distinctUntilChanged()).subscribe((value) => {
      if (this.sliderHandle && this.slider) {
        const compressedValue = this.convertValueToScreenDims(value);
        if (compressedValue !== undefined && compressedValue !== null) {
          this.sliderHandle.nativeElement.style.transform = `translate3d(0, ${-compressedValue}px, 0)`;
        }
      }
      const shiftedValue = value / 2 + 0.5;
      const midiValue = Math.ceil(shiftedValue * 127);

      this.midiSend.emit(midiValue);
    });

    if (this.slider) {
      this.$onDragStart = fromEvent<MouseEvent>(
        this.slider?.nativeElement,
        'mousedown'
      );
      this.$onDragStart.subscribe((event) => {
        event.preventDefault();
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.currentValue$.next(this.convertScreenDimsToValue(this.startY));
        this.isMouseDown = true;
      });

      this.$onDrag = fromEvent<MouseEvent>(document.body, 'mousemove');
      this.$onDrag.subscribe((event) => {
        // if (event.buttons === 1) {
        //   this.isMouseDown = false;
        // }
        if (this.isMouseDown) {
          this.calculateSliderValue(event);
        }
      });

      this.$onDragEnd = fromEvent<MouseEvent>(document.body, 'mouseup');
      this.$onDragEnd.subscribe((event) => {
        clearInterval(this.dragHoldInterval);
        this.isMouseDown = false;
        this.previousValue = this.currentValue$.value;
      });
    }
  }

  calculateSliderValue(event: MouseEvent) {
    const value = event.clientY - this.startY; // + this.previousValue;

    const offset = this.convertScreenDimsToValue(this.startY);

    if (this.slider) {
      const normalisedValue =
        (value / this.slider?.nativeElement.clientHeight) * 2;
      const normalisedAdjustedValue = Math.max(
        Math.min(
          -(normalisedValue * (1 / this.sliderHandleOffset)) + offset,
          1
        ),
        -1
      );

      this.currentValue$.next(normalisedAdjustedValue);
    }
  }

  convertValueToScreenDims(value: number) {
    if (this.slider) {
      const screenDimsValue = Math.min(
        Math.max(
          (this.slider?.nativeElement.clientHeight / 2) *
            value *
            this.sliderHandleOffset,
          -(this.slider?.nativeElement.clientHeight / 2) *
            this.sliderHandleOffset
        ),
        (this.slider?.nativeElement.clientHeight / 2) * this.sliderHandleOffset
      );

      return screenDimsValue;
    } else {
      throw new Error('slider is not defined');
    }
  }

  convertScreenDimsToValue(value: number) {
    if (this.slider) {
      const sliderHeight =
        this.slider?.nativeElement.clientHeight * this.sliderHandleOffset;
      const sliderBottom =
        this.slider?.nativeElement.getBoundingClientRect().bottom -
        (this.slider?.nativeElement.clientHeight *
          (1 - this.sliderHandleOffset)) /
          2;
      return Math.min(
        Math.max(((sliderBottom - value) / sliderHeight) * 2 - 1, -1),
        1
      );
    } else {
      throw new Error('slider is not defined');
    }
  }
}
