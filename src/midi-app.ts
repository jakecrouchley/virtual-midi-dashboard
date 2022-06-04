import express from "express";
import cors from "cors";
import { Server } from "http";
import path from "path";
import { Channel, ControlChange, Input, Note, Output } from "easymidi";
import WebSocket, { Server as WebSocketServer } from "ws";
import {
  ICCCell,
  ICell,
  IMIDICell,
  IOutputEvent,
  IMIDIEvent,
  ICCEvent,
  IInputEvent,
} from "../common";
import { ReplaySubject, Subject } from "rxjs";

class MidiApp {
  app = express();
  port = 8080;
  socketPort = 8082;

  midiChannel: Channel = 0;

  virtualInput?: Input;
  virtualOutput?: Output;

  websocket?: WebSocket;

  latestEvent$ = new ReplaySubject<IOutputEvent>(10);

  constructor() {
    this.setupMidi();
    this.setupServer();
  }

  setupMidi(): void {
    this.virtualInput = new Input("Virtual Dashboard", true);
    this.virtualOutput = new Output("Virtual Dashboard", true);
  }

  setupServer(): Server {
    const wss = new WebSocketServer({
      port: 8082,
    });
    wss.on("connection", (ws) => {
      this.websocket = ws;
      ws.on("message", (data) => {
        const event = JSON.parse(data.toString()) as IOutputEvent;
        const cell = event.cell as ICell;
        if (cell.type === "midi") {
          this.handleMIDI(event as IMIDIEvent);
        } else {
          this.handleCC(event as ICCEvent);
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

    this.virtualInput.on("noteon", (note: Note) => {
      console.log(note);
      // TODO: turn this into an IEvent and handle it on the frontend
      const event: IInputEvent = {
        type: "noteon",
        payload: note,
      };

      this.websocket.send(JSON.stringify(event), (error) => {
        console.error(error);
      });
    });

    // this.app.use(express.json());

    // this.app.post("/send-midi", (req, res) => {
    //   this.handleMIDI(req.body, "on");
    //   return res.status(200).send();
    // });

    // this.app.post("/send-midi-off", (req, res) => {
    //   this.handleMIDI(req.body, "off");
    //   return res.status(200).send();
    // });

    // this.app.post("/send-cc", (req, res) => {
    //   this.handleCC(req.body);
    //   return res.status(200).send();
    // });

    return this.app.listen(this.port, "0.0.0.0", () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${this.port}`);
    });
  }

  handleMIDI(event: IMIDIEvent) {
    const noteData: Note = {
      note: event.cell.note,
      velocity: event.velocity,
      channel: this.midiChannel,
    };
    console.log("midi value received: ", event);
    if (event.action === "on") {
      this.virtualOutput?.send("noteon", noteData);
    } else {
      this.virtualOutput?.send("noteoff", noteData);
    }
  }

  handleCC(event: ICCEvent) {
    const ccData: ControlChange = {
      controller: event.cell.controller,
      value: event.value,
      channel: this.midiChannel,
    };

    console.log("CC value received: ", ccData);

    this.virtualOutput?.send("cc", ccData);
  }
}
export default MidiApp;
