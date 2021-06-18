const easymidi = require("easymidi");
const virtualOutput = new easymidi.Output("Virtual Dashboard", true);

setInterval(() => {
  playChord([60, 64, 67]);
}, 3000);

const playChord = (midiNotes) => {
  midiNotes.forEach((note) => {
    virtualOutput.send("noteon", {
      note: note,
      velocity: 127,
      channel: 3,
    });
  });
};
