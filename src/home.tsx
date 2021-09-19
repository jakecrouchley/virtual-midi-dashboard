import React, { Component } from "react";
import Button from "./Button";

export default class Home extends Component {
  openDashboard() {
    open("http://localhost:8080/", "_blank");
  }

  render() {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button title={"Open Dashboard"} action={this.openDashboard}></Button>
      </div>
    );
  }
}
