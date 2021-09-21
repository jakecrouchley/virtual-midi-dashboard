import React, { Component } from "react";
import Button from "./Button";
import EventList from "./eventList";

export default class Home extends Component {
  openDashboard() {
    open("http://localhost:8080/", "_blank", "width=700");
  }

  render() {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button title={"Open Dashboard"} action={this.openDashboard}></Button>
        <EventList events={[{ description: "hello world" }]}></EventList>
      </div>
    );
  }
}
