import { ControlChange, Note } from "easymidi";

export const DATA_VERSION = "1.0.2";

export const CELL_TYPES = ["button", "knob", "slider"];

export type MidiEventType =
  | "noteon"
  | "noteoff"
  | "poly aftertouch"
  | "cc"
  | "program"
  | "channel aftertouch"
  | "pitch"
  | "position"
  | "mtc"
  | "select"
  | "clock"
  | "start"
  | "continue"
  | "stop"
  | "activesense"
  | "reset"
  | "sysex";

/** Any changes to ICell, IMIDICell and ICCCell you'll need to update the data version */
export interface ICell {
  version: string;
  cellType: typeof CELL_TYPES[number];
  label: string;
  type: "midi" | "cc";
  iconName: string;
  index: number;
  sustain?: boolean;
}

export interface IMIDICell extends ICell {
  note: number;
  velocity: number;
}

export interface ICCCell extends ICell {
  controller: number;
  value: number;
}

export interface IOutputEvent {
  cell: ICell | IMIDICell | ICCCell;
  action: "on" | "off";
}
export interface IMIDIEvent extends IOutputEvent {
  cell: IMIDICell;
  velocity: number;
}
export interface ICCEvent extends IOutputEvent {
  cell: ICCCell;
  value: number;
}

export interface IInputEvent {
  type: MidiEventType;
  payload: Note | ControlChange;
}
