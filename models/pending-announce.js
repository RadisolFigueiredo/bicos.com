const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const pendingannounceSchema = new Schema({
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

pendingannounceSchema.set('timestamps', true);

const Pendingannounce = mongoose.model('Pendingannounce', pendingannounceSchema);

module.exports = Pendingannounce;
