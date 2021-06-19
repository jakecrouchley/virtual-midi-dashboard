"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const easymidi_1 = require("easymidi");
class App {
    constructor() {
        this.app = express_1.default();
        this.port = 8080;
        this.midiChannel = 1;
        this.setupMidi();
        this.setupServer();
    }
    setupMidi() {
        this.virtualOutput = new easymidi_1.Output("Virtual Dashboard", true);
    }
    setupServer() {
        this.app.use(cors_1.default());
        this.app.use("/", express_1.default.static(path_1.default.join(__dirname, "..", "virtual-midi-dashboard/dist/virtual-midi-dashboard")));
        this.app.use(express_1.default.json());
        this.app.post("/send-midi", (req, res) => {
            var _a;
            const params = req.body;
            console.log(params);
            const { note, velocity } = params;
            const noteData = {
                note,
                velocity,
                channel: 0,
            };
            (_a = this.virtualOutput) === null || _a === void 0 ? void 0 : _a.send("noteon", noteData);
            return res.status(200).send();
        });
        return this.app.listen(this.port, () => {
            // tslint:disable-next-line:no-console
            console.log(`server started at http://localhost:${this.port}`);
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map