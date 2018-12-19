const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const refusedannounceSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  employerId: { type: Schema.Types.ObjectId, ref: 'User' },
  arrayOfCandidates: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deniedCandidates: Array,
  title: String,
  description: String,
  value: String,
  location: String,
  show: { type: Boolean, default: true }
});

refusedannounceSchema.set('timestamps', true);

const Refusedannounce = mongoose.model('Refusedannounce', refusedannounceSchema);

module.exports = Refusedannounce;
