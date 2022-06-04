import { ControlChange, Note } from "easymidi";
export declare const DATA_VERSION = "1.0.2";
export declare const CELL_TYPES: string[];
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
    type: "noteon" | "cc";
    payload: Note | ControlChange;
}
//# sourceMappingURL=index.d.ts.map