import * as React from "react";
import * as ReactDOM from "react-dom";
import Home from "./home";
import MidiApp from "./midi-app";

export const midiApp = new MidiApp();

function render() {
  const reactContainer = document.getElementById("react-container");
  ReactDOM.render(<Home />, reactContainer);
}

render();
