export const DATA_VERSION = "1.0.0";

export const CELL_TYPES = ["button", "knob", "slider"];

export interface ICell {
  version: string;
  cellType: typeof CELL_TYPES[number];
  label: string;
  type: "midi" | "cc";
  iconName: string;
  index: number;
}

export interface IMIDICell extends ICell {
  note: number;
  velocity: number;
}

export interface ICCCell extends ICell {
  controller: number;
  value: number;
}
