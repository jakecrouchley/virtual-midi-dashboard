import express from "express";
import cors from "cors";
import { Server } from "http";
import path from "path";
import { ControlChange, Note, Output } from "easymidi";
import WebSocket, { Server as WebSocketServer } from "ws";
import { ICCCell, ICell, IMIDICell, MIDIEvent } from "../common";
import { ReplaySubject, Subject } from "rxjs";

class MidiApp {
  app = express();
  port = 8080;
  socketPort = 8082;

  midiChannel: 0 = 0;

  virtualOutput?: Output;

  websocket?: WebSocket;

  latestEvent$ = new ReplaySubject<MIDIEvent>(10);

  constructor() {
    this.setupMidi();
    this.setupServer();
  }

  setupMidi(): void {
    this.virtualOutput = new Output("Virtual Dashboard", true);
  }

  setupServer(): Server {
    const wss = new WebSocketServer({
      port: 8082,
    });
    wss.on("connection", (ws) => {
      this.websocket = ws;
      ws.on("message", (data) => {
        const event = JSON.parse(data.toString()) as MIDIEvent;
        const cell = event.cell as ICell;
        if (cell.type === "midi") {
          const midiCell = cell as IMIDICell;
          this.handleMIDI(midiCell, event.action);
        } else {
          const ccCell = cell as ICCCell;
          this.handleCC(ccCell);
        }
        this.latestEvent$.next(event);
      });
    });
    this.app.use(cors());

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
      this.handleMIDI(req.body, "on");
      return res.status(200).send();
    });

    this.app.post("/send-midi-off", (req, res) => {
      this.handleMIDI(req.body, "off");
      return res.status(200).send();
    });

    this.app.post("/send-cc", (req, res) => {
      this.handleCC(req.body);
      return res.status(200).send();
    });

    return this.app.listen(this.port, "0.0.0.0", () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${this.port}`);
    });
  }

  handleMIDI(data: IMIDICell, type: "on" | "off") {
    const { note, velocity } = data;
    const noteData: Note = {
      note,
      velocity,
      channel: this.midiChannel,
    };
    if (type === "on") {
      this.virtualOutput?.send("noteon", noteData);
    } else {
      this.virtualOutput?.send("noteoff", noteData);
    }
  }

  handleCC(data: ICCCell) {
    const { controller, value } = data;
    const ccData: ControlChange = {
      controller,
      value,
      channel: this.midiChannel,
    };
    console.log(ccData);

    this.virtualOutput?.send("cc", ccData);
  }
}
export default MidiApp;
