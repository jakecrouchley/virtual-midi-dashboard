import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwaService implements OnInit {
  deferredPrompt: any;

  constructor() {}

  ngOnInit(): void {
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
