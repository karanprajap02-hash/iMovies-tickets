const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide theatre address'],
      trim: true,
    },
    adminName: {
      type: String,
      default: 'Cinema Admin',
      trim: true,
    },
    lowerSeats: {
      type: Number,
      default: 36,
    },
    middleSeats: {
      type: Number,
      default: 30,
    },
    balconySeats: {
      type: Number,
      default: 16,
    },
    lowerSeatPrice: {
      type: Number,
      default: 150,
    },
    middleSeatPrice: {
      type: Number,
      default: 250,
    },
    balconySeatPrice: {
      type: Number,
      default: 400,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ER Diagram alias virtuals
theatreSchema.virtual('theatreId').get(function () {
  return this._id;
});
theatreSchema.virtual('theatreName').get(function () {
  return this.name;
});
theatreSchema.virtual('location').get(function () {
  return `${this.address}, ${this.city}`;
});

theatreSchema.index({ city: 1, name: 1 });

const Theatre = mongoose.model('Theatre', theatreSchema);
module.exports = Theatre;
