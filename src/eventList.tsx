import React, { Component } from "react";

type Event = {
  description: string;
};

type EventListProps = {
  events: Event[];
};

export default class EventList extends Component<
  EventListProps,
  EventListProps
> {
  constructor(props: EventListProps) {
    super(props);

    this.state = {
      events: props.events,
    };
  }

  renderEventsList() {
    return (
      <div>
        {this.state.events.map((event) => {
          return <p>{event.description}</p>;
        })}
      </div>
    );
  }

  render() {
    return <div>{this.renderEventsList()}</div>;
  }
}
