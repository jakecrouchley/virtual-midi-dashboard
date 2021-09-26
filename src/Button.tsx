import React, { Component } from "react";
import styled, { css } from "styled-components";

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
    const StyledButton = styled.button`
      margin: 16px;
      padding: 16px;
      background-color: white;
      border: solid 2px #e3e3e3;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background-color: #e3e3e3;
      }
    `;
    return (
      <StyledButton onClick={this.state.action}>
        {this.state.title}
      </StyledButton>
    );
  }
}
