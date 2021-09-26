import express from "express";
import cors from "cors";
import { Server } from "http";
import path from "path";
import { ControlChange, Note, Output } from "easymidi";
import WebSocket, { Server as WebSocketServer } from "ws";
import { ICell } from "../common/index";

export class MidiApp {
  app = express();
  port = 8080;

  midiChannel: 0 = 0;

  virtualOutput?: Output;

  websocket?: WebSocket;

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
        const jsonData = JSON.parse(data.toString());
        console.log("Received: ", jsonData);
        const cell = jsonData as ICell;
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

  handleMIDI(data: any, type: "on" | "off") {
    const { note, velocity, label } = data;
    if (type === "on") {
      console.log(`${label} on`);

      const noteData: Note = {
        note,
        velocity,
        channel: this.midiChannel,
      };
      this.virtualOutput?.send("noteon", noteData);
    } else {
      console.log(`${label} off`);

      const noteData: Note = {
        note,
        velocity,
        channel: this.midiChannel,
      };
      this.virtualOutput?.send("noteoff", noteData);
    }
  }

  handleCC(data: any) {
    const { controller, value } = data;
    const ccData: ControlChange = {
      controller,
      value,
      channel: this.midiChannel,
    };
    this.virtualOutput?.send("cc", ccData);
  }
}
