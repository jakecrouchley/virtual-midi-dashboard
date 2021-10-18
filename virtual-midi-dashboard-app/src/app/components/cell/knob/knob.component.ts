import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-knob',
  templateUrl: './knob.component.html',
  styleUrls: ['./knob.component.scss'],
})
export class KnobComponent implements OnInit, AfterViewInit {
  @Input() label!: string;
  @Input() type!: string;
  @Input() info!: string;

  @ViewChild('knob') knob?: ElementRef<HTMLDivElement>;
  @ViewChild('knobIndicator') knobIndicator?: ElementRef;
  // @ViewChild('dragIndicator') dragIndicator?: ElementRef<HTMLSpanElement>;

  // Drag Event Vars
  startX = 0;
  startY = 0;
  previousValue = 0;
  isMouseDown = false;
  dragHoldInterval: any;

  currentRotation$ = new BehaviorSubject(0);

  // Event Observables
  $onDragStart?: Observable<MouseEvent>;
  $onDrag?: Observable<MouseEvent>;
  $onDragEnd?: Observable<MouseEvent>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.currentRotation$.subscribe((rotation) => {
      if (this.knobIndicator) {
        this.knobIndicator.nativeElement.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
      }
    });

    if (this.knob) {
      this.$onDragStart = fromEvent<MouseEvent>(
        this.knob?.nativeElement,
        'mousedown'
      );
      this.$onDragStart.subscribe((event) => {
        event.preventDefault();
        console.log('START DRAGGING: ', event);
        this.startX = event.clientX;
        this.startY = event.clientY;
        // if (this.dragIndicator) {
        //   this.dragIndicator.nativeElement.style.display = 'block';
        //   this.dragIndicator.nativeElement.style.top = `${
        //     event.clientY - 10
        //   }px`;
        //   this.dragIndicator.nativeElement.style.left = `${
        //     event.clientX - 10
        //   }px`;
        // }
        this.isMouseDown = true;
      });

      this.$onDrag = fromEvent<MouseEvent>(document.body, 'mousemove');
      this.$onDrag.subscribe((event) => {
        if (this.isMouseDown) {
          this.calculateRotationFromEvent(event);
        }
      });

      this.$onDragEnd = fromEvent<MouseEvent>(document.body, 'mouseup');
      this.$onDragEnd.subscribe((event) => {
        clearInterval(this.dragHoldInterval);
        this.isMouseDown = false;
        this.startX = 0;
        this.startY = 0;
        this.previousValue = this.currentRotation$.value;
        // if (this.dragIndicator) {
        //   this.dragIndicator.nativeElement.style.display = 'none';
        // }
      });

      fromEvent<MouseEvent>(this.knob?.nativeElement, 'dblclick').subscribe(
        (_) => {
          this.currentRotation$.next(0);
          this.previousValue = 0;
        }
      );
    }
  }

  calculateRotationFromEvent(event: MouseEvent) {
    console.log('ROTATION EVENT: ', event);
    const value = event.clientY - this.startY + this.previousValue;
    this.currentRotation$.next(value);

    // const stepValue = event.clientY - this.startY;
    // this.currentRotation$.next(this.currentRotation$.value + stepValue / 50);
    // if (this.previousY) {
    //   // const diffY =
    //   if (this.previousY > event.clientY) {
    //     this.currentRotation$.next(this.currentRotation$.value + 1);
    //   } else if (this.previousY < event.clientY) {
    //     this.currentRotation$.next(this.currentRotation$.value - 1);
    //   }
    // }
    // this.previousY = event.clientY;
  }
}
