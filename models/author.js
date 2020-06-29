const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutherSchema = new Schema({
    first_name: {type: String, required: true, maxlength:100},
    family_name: {type: String, required: true, maxlength:100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
})

//virtuals for writer full name
AutherSchema.virtual('name')
.get(() => {
    let fullName = '';
    if (this.first_name && this.family_name) {
        fullName = `${this.first_name}, ${this.family_name}`;
    }

    if (!this.first_name || !this.family_name) {
        fullName = '';
    }

    return fullName;
})

// Virtuals for writer lifespan
AutherSchema.virtual('lifespan')
.get(() => {
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
})


// Virtual for author's URL
AutherSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

//Export model
module.exports = mongoose.model('Author', AutherSchema);
