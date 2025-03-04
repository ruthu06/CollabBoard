import mongoose from 'mongoose';
const pointSchema = new mongoose.Schema({
  x: Number,
  y: Number
}); 

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  drawings: [
    {
      points: [pointSchema], 
      tool: { type: String },
      color: { type: String, default:"black" },
      circledimension: { type: [Number], default: undefined }, 
      rectdimension: { type: [Number], default: undefined },
      textdimension:{ type: [Number] , default: undefined},
      text: { type: String, default: undefined},
    }
  ],
  messages: [
    {
      user: { type: String },
      text: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ]
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
