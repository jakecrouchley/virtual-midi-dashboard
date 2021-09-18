import express from "express";
import cors from "cors";
import { Server } from "http";
import path from "path";
import { ControlChange, Note, Output } from "easymidi";

export class MidiApp {
  app = express();
  port = 8080;

  midiChannel: 0 = 0;

  virtualOutput?: Output;

  constructor() {
    this.setupMidi();
    this.setupServer();
  }

  setupMidi(): void {
    this.virtualOutput = new Output("Virtual Dashboard", true);
  }

  setupServer(): Server {
    this.app.use(cors());

    console.log(__dirname);

    this.app.use(
      "/",
      express.static(
        path.join(
          __dirname,
          "../virtual-midi-dashboard-app/dist/virtual-midi-dashboard"
        )
      )
    );

    this.app.use(express.json());

    this.app.post("/send-midi", (req, res) => {
      const params = req.body;
      const { note, velocity, label } = params;
      console.log(`${label} on`);

      const noteData: Note = {
        note,
        velocity,
        channel: this.midiChannel,
      };
      this.virtualOutput?.send("noteon", noteData);
      return res.status(200).send();
    });

    this.app.post("/send-midi-off", (req, res) => {
      const params = req.body;
      const { note, velocity, label } = params;
      console.log(`${label} off`);

      const noteData: Note = {
        note,
        velocity,
        channel: this.midiChannel,
      };
      this.virtualOutput?.send("noteoff", noteData);
      return res.status(200).send();
    });

    this.app.post("/send-cc", (req, res) => {
      const params = req.body;
      const { controller, value } = params;

      const ccData: ControlChange = {
        controller,
        value,
        channel: this.midiChannel,
      };
      this.virtualOutput?.send("cc", ccData);
      return res.status(200).send();
    });

    return this.app.listen(this.port, "0.0.0.0", () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${this.port}`);
    });
  }
}
