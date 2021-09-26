import React, { Component } from "react";
import Button from "./Button";
import EventList from "./eventList";

export default class Home extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  launchDashboard() {
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
        <p>
          Server running on <a target="_blank" href=""></a>
        </p>
        <Button
          title={"Launch Dashboard"}
          action={this.launchDashboard}
        ></Button>
        <EventList></EventList>
      </div>
    );
  }
}
