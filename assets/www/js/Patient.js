/**
 * Created by Charlie on 15/03/2016.
 */


function Patient(id) {

    if (id === undefined) id = 0;

    //var store = new Store();
    this.storeExample = Store.getCollection('patients');
    //Example data

    var forename = this.storeExample.findOne({ _id: id }).forename;
    var surname = this.storeExample.findOne({ _id: id }).surname;
    var location = null;
    var condition = null;
    var telephone = null;

    this.getName = function(){
        return forename + " " + surname;
    };

	this.getForename = function(){
        return forename;
    };

	this.getSurname = function(){
        return surname;
    };
    this.getLocation = function(){
        /* Location isn't in the store yet but would look like this:
        * -----------------------------------------------------------------------
        *  var jsonObject = Patient.prototype.findOne({_id: '1'});
        *  var location = jsonObject[3];
        *  return location;
        * -----------------------------------------------------------------------
        * */
    };
    this.getCondition = function(){
        /* Condition isn't in the store yet but would look like this:
         * -----------------------------------------------------------------------
         *  var jsonObject = Patient.prototype.findOne({_id: '1'});
         *  var condition = jsonObject[4];
         *  return condition;
         * -----------------------------------------------------------------------
         * */
    };
    this.getTelephone = function(){
        /* Telephone isn't in the store yet but would look like this:
         * -----------------------------------------------------------------------
         *  var jsonObject = Patient.prototype.findOne({_id: '1'});
         *  var telephone = jsonObject[5];
         *  return telephone;
         * -----------------------------------------------------------------------
         * */
    };
    this.getNotes = function(){
        /* Notes isn't in the store yet but would look like this:
         * -----------------------------------------------------------------------
         *  var jsonObject = Patient.prototype.findOne({_id: '1'});
         *  var notes = jsonObject[6];
         *  return notes;
         * -----------------------------------------------------------------------
         * */
    };
    this.getPatientFile = function(){};
}

Patient.prototype.insert = function(id, forename, surname){
    this.storeExample.insert({ _id: id, forename: forename, surname: surname });
};
Patient.prototype.remove = function(id){
    this.storeExample.remove({ _id: id });
};
Patient.prototype.find = function(forename){
    return this.storeExample.find({ forename: forename });
};
Patient.prototype.getAll = function(){
    return this.storeExample.find({});
};
Patient.prototype.findOne = function(forename, surname){
    return this.storeExample.findOne({ forename: forename, surname: surname });
};
