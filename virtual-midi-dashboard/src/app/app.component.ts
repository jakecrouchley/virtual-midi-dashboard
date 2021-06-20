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

  deferredPrompt: any;

  constructor(
    private dataService: DataService,
    private midiService: MidiService
  ) {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;

      // Update UI notify the user they can install the PWA

      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`);
    });
    window.addEventListener('appinstalled', () => {
      // Hide the app-provided install promotion

      // Clear the deferredPrompt so it can be garbage collected
      this.deferredPrompt = null;
      // Optionally, send analytics event to indicate successful install
      console.log('PWA was installed');
    });
  }

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

  async installPWA() {
    // Hide the app provided install promotion

    // Show the install prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
  }
}
