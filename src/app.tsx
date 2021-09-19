import * as React from "react";
import * as ReactDOM from "react-dom";
import Home from "./home";

function render() {
  const reactContainer = document.getElementById("react-container");
  ReactDOM.render(<Home />, reactContainer);
}

render();
