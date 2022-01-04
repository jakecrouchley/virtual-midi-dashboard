export const DATA_VERSION = "1.0.2";

export const CELL_TYPES = ["button", "knob", "slider"];

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

export type MIDIEvent = {
  cell: ICell | IMIDICell | ICCCell;
  velocity?: number;
  value?: number;
};
