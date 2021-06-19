import express from "express";
import cors from "cors";
import { Server } from "http";
import path from "path";
import { Note, Output } from "easymidi";

export class App {
  app = express();
  port = 8080;

  midiChannel = 1;

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

    this.app.use(
      "/",
      express.static(
        path.join(
          __dirname,
          "..",
          "virtual-midi-dashboard/dist/virtual-midi-dashboard"
        )
      )
    );

    this.app.use(express.json());

    this.app.post("/send-midi", (req, res) => {
      const params = req.body;
      console.log(params);
      const { note, velocity } = params;

      const noteData: Note = {
        note,
        velocity,
        channel: 0,
      };
      this.virtualOutput?.send("noteon", noteData);
      return res.status(200).send();
    });

    return this.app.listen(this.port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${this.port}`);
    });
  }
}
