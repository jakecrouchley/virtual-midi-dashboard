import React, { Component } from "react";

type ButtonState = { title: string; action: () => void };

export default class Button extends Component<ButtonState, ButtonState> {
  constructor(props: ButtonState) {
    super(props);

    this.state = {
      title: props.title,
      action: props.action,
    };
  }

  render() {
    return <button onClick={this.state.action}>{this.state.title}</button>;
  }
}
