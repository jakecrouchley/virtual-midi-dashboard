# Virtual MIDI Dashboard
(more creative name pending)

A configurable dashboard for controlling MIDI-compatible software by creating a virtual MIDI device. Currently supports either simple MIDI or CC commands.

`virtual-midi-dashboard-app/` contains the front-end app, built in Angular. More instructions are included in `README.md` in this directory, but this requires [Node.js](https://nodejs.org/en/) and can be started by running:

- `npm install`
- `npm start`

`virtual-midi-dashboard-server/` contains the server application, this handles the actual virtual MIDI device independently from the client, and the API can be accessed directly if required. Similarly, this can be started with the same commands as above.

Feature requests can be commented directly via Notion [here](https://jakecrouchley.notion.site/Virtual-MIDI-Dashboard-Public-Roadmap-5b49cc14b5d64e5fa4d2891969d09d51).


