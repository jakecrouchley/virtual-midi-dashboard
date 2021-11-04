export declare const DATA_VERSION = "1.0.0";
export declare const CELL_TYPES: string[];
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
export declare type MIDIEvent = {
    cell: ICell | IMIDICell | ICCCell;
    action: "on" | "off";
    velocity?: number;
    value?: number;
};
//# sourceMappingURL=index.d.ts.map