var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Thanks to http://blog.matoski.com/articles/jwt-express-node-mongoose/

// set up a mongoose model
var UserSchema = new Schema({
  name: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    },
  challenge: {
	type: String
  }
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(42, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.verify = function (response)
{
	// Routines to generate TOTP
	var speakeasy = require('speakeasy');

	var challenge_response = speakeasy.totp({
		 secret: this.challenge,
		 encoding: 'base32'});

	// this.password is a bcrypt hash since it's taken from the user database
	// Passwords aren't actually stored in the user database
	// This checks the validity of bcrypt(challenge_response + bcrypt(password))
	return bcrypt.compareSync(challenge_response + this.password, response);
}

// No longer used
UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
