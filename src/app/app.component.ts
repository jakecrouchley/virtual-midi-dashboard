import { Component, OnInit } from '@angular/core';
import { DataService, ICell } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  NUM_ROWS = 3;

  cellSideLength = window.innerHeight / this.NUM_ROWS;

  cells: ICell[] = [];

  constructor(public dataService: DataService) {}

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
    });
  }

  performCellAction(cell: ICell) {
    if (cell.action) {
      cell.action();
    }
  }
}
