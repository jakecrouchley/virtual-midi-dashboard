import { ICCCell, IMIDICell, MIDIEvent } from "../common";
import React, { Component } from "react";
import { midiApp } from "./app";

type EventListState = {
  events: MIDIEvent[];
};

export default class EventList extends Component<any, EventListState> {
  constructor(props: any) {
    super(props);

    this.state = {
      events: [],
    };
  }

  componentDidMount() {
    midiApp.latestEvent$.subscribe((event) => {
      this.setState({
        events: [event, ...this.state.events],
      });
    });
  }

  render() {
    return (
      <div
        style={{
          flex: 1,
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflowY: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th>Index</th>
              <th>Type</th>
              <th>Action</th>
              <th>Note/Controller</th>
              <th>Velocity/Value</th>
              <th>Label</th>
              <th>Control Type</th>
              <th>Icon Name</th>
            </tr>
          </thead>
          {this.state.events.map((event, index) => {
            return (
              <tr key={index} style={{ textAlign: "center" }}>
                <td>{event.cell.index}</td>
                <td>{event.cell.type}</td>
                <td>{event.action}</td>
                <td>
                  {(event.cell as IMIDICell)?.note ||
                    (event.cell as ICCCell)?.controller}
                </td>
                <td>{event.velocity || event.value}</td>
                <td>{event.cell.label}</td>
                <td>{event.cell.cellType}</td>
                <td>{event.cell.iconName}</td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}
