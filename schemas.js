var Friends = new Schema({ User: Schema.ObjectId });

User = new Schema({
  first_name        : { type: String, match: /[a-z]/, set: uCase, default : 'John' },
  last_name         : { type: String, match: /[a-z]/, set: uCase, default : 'Doe' },
  email             : { type: String, index: { unique: true }}},
  password          : { type: String },
  image             : { type: String },
  address           : {
    street          : String,
    streetno        : String,
    zip             : String,
    city            : String,
    country         : String
  },
  settings          : {
    last_login      : Date,
    friends         : [Friends]
  }
  timemade          : { type: Date, default: Date.now },
  timeedited        : { type: Date, default: Date.now }
});

User.methods.getMissions = function (callback) {
  // returns a Query
  return this.model('Mission').find({ _user: this._id }, callback);
};

Mission = new Schema({
  name              : { type: String, match /[a-z]/, default : 'Mission' },
  description       : { type: String, default : 'Description' },
  _user             : [User],
  timemade          : { type: Date, default: Date.now },
  timeedited        : { type: Date, default: Date.now }
});
