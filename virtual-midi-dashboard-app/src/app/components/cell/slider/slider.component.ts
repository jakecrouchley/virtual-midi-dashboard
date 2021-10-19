import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';

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

  // Drag Event Vars
  startX = 0;
  startY = 0;
  previousValue = 0;
  isMouseDown = false;
  dragHoldInterval: any;

  // -100 to 100
  currentValue$ = new BehaviorSubject(0);

  // Event Observables
  $onDragStart?: Observable<MouseEvent>;
  $onDrag?: Observable<MouseEvent>;
  $onDragEnd?: Observable<MouseEvent>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.currentValue$.subscribe((value) => {
      if (this.sliderHandle && this.slider) {
        const compressedValue = Math.min(
          Math.max(
            (this.slider?.nativeElement.clientHeight / 2) * value,
            -(this.slider?.nativeElement.clientHeight / 2) * 0.708
          ),
          (this.slider?.nativeElement.clientHeight / 2) * 0.708
        );
        this.sliderHandle.nativeElement.style.transform = `translate3d(0, ${compressedValue}px, 0)`;
      }
    });

    if (this.slider) {
      this.$onDragStart = fromEvent<MouseEvent>(
        this.slider?.nativeElement,
        'mousedown'
      );
      this.$onDragStart.subscribe((event) => {
        event.preventDefault();
        console.log('START DRAGGING: ', event);
        this.startX = event.clientX;
        this.startY = event.clientY;
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
        this.startX = 0;
        this.startY = 0;
        this.previousValue = this.currentValue$.value;
        // if (this.dragIndicator) {
        //   this.dragIndicator.nativeElement.style.display = 'none';
        // }
      });

      fromEvent<MouseEvent>(this.slider?.nativeElement, 'dblclick').subscribe(
        (_) => {
          this.currentValue$.next(0);
          this.previousValue = 0;
        }
      );
    }
  }

  calculateSliderValue(event: MouseEvent) {
    const value = event.clientY - this.startY + this.previousValue;
    if (this.slider) {
      const normalisedValue =
        (value / this.slider?.nativeElement.clientHeight) * 2 * (1 / 0.708);

      this.currentValue$.next(normalisedValue);
    }
  }
}
