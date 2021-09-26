import os, { networkInterfaces } from "os";
import React, { Component, createRef } from "react";
import QRCode from "qrcode";

export default class ServerDetails extends Component<
  any,
  { serverAddress: string }
> {
  canvasRef = createRef<HTMLCanvasElement>();

  constructor(props: any) {
    super(props);

    this.state = {
      serverAddress: "",
    };
  }

  componentDidMount() {
    const netInterfaces = this.getNetworkInterfaces();
    const en0 = netInterfaces.en0;
    const eth0 = netInterfaces.eth0;
    if (en0 && en0[0]) {
      this.setState({
        serverAddress: `http://${en0[0]}:8080`,
      });
    } else if (eth0 && eth0) {
      this.setState({
        serverAddress: `http://${eth0[0]}:8080`,
      });
    }
  }

  componentDidUpdate() {
    if (this.state.serverAddress) {
      QRCode.toCanvas(this.canvasRef.current, this.state.serverAddress);
    }
  }

  getNetworkInterfaces() {
    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === "IPv4" && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }
    return results;
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <p>Join the same network as this machine and scan the QR code</p>
        <canvas ref={this.canvasRef}></canvas>
      </div>
    );
  }
}
