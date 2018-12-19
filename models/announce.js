const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const announceSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  employerId: { type: Schema.Types.ObjectId, ref: 'User' },
  arrayOfCandidates: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deniedCandidates: Array,
  oldEmployers: Array,
  title: String,
  description: String,
  value: String,
  location: String,
  show: { type: Boolean, default: true }
});

announceSchema.set('timestamps', true);

const Announce = mongoose.model('Announce', announceSchema);

module.exports = Announce;
