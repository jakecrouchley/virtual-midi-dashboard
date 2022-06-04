import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
import { ControlValue } from '../cell.component';

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

  @Output() midiSend: EventEmitter<ControlValue> = new EventEmitter();

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
  $onDragExit?: Observable<MouseEvent>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.currentRotation$.subscribe((rotation) => {
      if (this.knobIndicator) {
        this.knobIndicator.nativeElement.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
      }

      const midiValue = Math.ceil((rotation / 360) * 127);
      this.midiSend.emit({
        action: 'on',
        value: midiValue,
      });
      this.midiSend.emit({
        action: 'off',
        value: midiValue,
      });
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
        // if (event.buttons === 1) {
        //   this.isMouseDown = false;
        // }
        if (this.isMouseDown) {
          this.calculateRotationFromEvent(event);
        } else {
          const mouseup = new Event('mouseup');
          event.target?.dispatchEvent(mouseup);
        }
      });

      const onDragEnd = () => {
        clearInterval(this.dragHoldInterval);
        this.isMouseDown = false;
        this.startX = 0;
        this.startY = 0;
        if (this.currentRotation$.value >= 360) {
          this.currentRotation$.next(360 - this.currentRotation$.value);
        }
        this.previousValue = this.currentRotation$.value;
      };

      this.$onDragEnd = fromEvent<MouseEvent>(document.body, 'mouseup');
      this.$onDragEnd.subscribe((_) => onDragEnd());

      this.$onDragExit = fromEvent<MouseEvent>(document.body, 'mouseleave');
      this.$onDragExit.subscribe((_) => onDragEnd());

      fromEvent<MouseEvent>(this.knob?.nativeElement, 'dblclick').subscribe(
        (_) => {
          this.currentRotation$.next(0);
          this.previousValue = 0;
        }
      );
    }
  }

  calculateRotationFromEvent(event: MouseEvent) {
    const value = this.startY - event.clientY + this.previousValue;
    if (value >= 360) {
      this.currentRotation$.next(value - 360);
    } else {
      this.currentRotation$.next(value);
    }

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
