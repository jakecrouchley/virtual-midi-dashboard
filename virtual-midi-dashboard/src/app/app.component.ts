import { Component, OnInit } from '@angular/core';
import { DataService, ICell } from './services/data.service';
import { MidiService } from './services/midi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  NUM_ROWS = 3;

  cellSideLength = window.innerHeight / this.NUM_ROWS;

  cells: ICell[] = [];

  constructor(
    private dataService: DataService,
    private midiService: MidiService
  ) {}

  ngOnInit() {
    this.dataService.getCells().subscribe((cells) => {
      this.cells = cells;
    });
  }

  appendNewCell() {
    this.dataService.appendCell({
      note: 64,
      velocity: 127,
      label: 'Test',
      event: 'noteon',
    });
  }

  performCellAction(cell: ICell) {
    console.log(cell);

    this.midiService
      .sendMidiNoteOn(cell.note, cell.velocity)
      .subscribe((response) => {
        console.log(response);
      });
  }
}
