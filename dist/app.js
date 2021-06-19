"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
class App {
    constructor() {
        this.app = express_1.default();
        this.port = 8080;
        this.setupServer();
    }
    setupServer() {
        console.log(path_1.default.join(__dirname, "..", "virtual-midi-dashboard/dist/virtual-midi-dashboard"));
        this.app.use("/", express_1.default.static(path_1.default.join(__dirname, "..", "virtual-midi-dashboard/dist/virtual-midi-dashboard")));
        return this.app.listen(this.port, () => {
            // tslint:disable-next-line:no-console
            console.log(`server started at http://localhost:${this.port}`);
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map