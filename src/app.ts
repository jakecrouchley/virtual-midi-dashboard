import express from "express";
import { Server } from "http";
import path from "path";

export class App {
  app = express();
  port = 8080;

  constructor() {
    this.setupServer();
  }

  setupServer(): Server {
    console.log(
      path.join(
        __dirname,
        "..",
        "virtual-midi-dashboard/dist/virtual-midi-dashboard"
      )
    );

    this.app.use(
      "/",
      express.static(
        path.join(
          __dirname,
          "..",
          "virtual-midi-dashboard/dist/virtual-midi-dashboard"
        )
      )
    );

    return this.app.listen(this.port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${this.port}`);
    });
  }
}
