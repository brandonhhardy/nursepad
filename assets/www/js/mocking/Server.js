/**
 * Mocks AJAX requests to a server.
 *
 * @roadmap
 * - Add session mocking
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

// Setup Server Database
ServerStore = Pocket.new({ autoCommit: false });

// Server initialisation
(function(){
	var accounts = ServerStore.addCollection('accounts');
	accounts.insert({_id: 0, email: 'vr00051@surrey.ac.uk', password: 'bye', forename: 'Vincent', surname: 'Racine', patients: [0,1,3,4]});
	accounts.insert({_id: 0, email: 'test@example.com', password: 'group7', forename: 'Foo', surname: 'Bar', patients: [0,1,2,3,4]});

	var patients = ServerStore.addCollection('patients');
	patients.insert({_id: 0, forename: 'Vincent', surname: 'Racine', telephone: '07585958236', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});
	patients.insert({_id: 1, forename: 'Peter', surname: 'Lane', telephone: '07819231412', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});
	patients.insert({_id: 2, forename: 'Alex', surname: 'Fell', telephone: '07777345645', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});
	patients.insert({_id: 3, forename: 'Francesca', surname: 'Howe', telephone: '07785234524', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});
	patients.insert({_id: 4, forename: 'John', surname: 'Torr', telephone: '07456345124', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});
	patients.insert({_id: 5, forename: 'Marry', surname: 'Jane', telephone: '07756856786', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});
	patients.insert({_id: 6, forename: 'Foo', surname: 'Bar', telephone: '07643567786', location: '28+Blackwell+Ave,+Guildford,+Surrey+GU2+8LU'});

})();

/**
 * [ENDPOINT] Authenticate
 *
 * @params email {String}
 * @params password {String}
 *
 * @response status {'OK'|'Unauthorised'}, errors {Array}
 */
$.mockjax({
	url: "/api/authenticate",
	method: 'POST',
	response: function (request) {
		var email = request.data.email,
			password = request.data.password,
			response = { errors: [] };

		if(email.length === 0){
			response.errors.push({
				field: 'email',
				message: 'Email cannot be blank'
			});
		}

		if(password.length === 0) {
			response.errors.push({
				field: 'password',
				message: 'Password cannot be blank'
			});
		}

		if(response.errors.length === 0){
			var account = ServerStore.getCollection('accounts').findOne({ email: email.toLowerCase() });
			if(account){
				if(account.password === password){
					account.token = 'ASItyUdF3WEfa4lkgASdDC';
					response.token = account.token;
					ServerStore.getCollection('accounts').update({_id: account._id}, account);
				}else{
					response.errors.push({
						field: 'password',
						message: 'Password is incorrect'
					});
				}
			}else{
				response.errors.push({
					field: 'email',
					message: 'Account does not exist'
				});
			}
		}

		if(response.errors.length === 0){
			this.status = 200;
			response.status = 'OK';
		}else{
			this.status = 401;
			response.status = 'Unauthorized';
		}

		this.responseText = response;
	}
});

/**
 * [ENDPOINT] Patients
 */
$.mockjax({
	url: "api/patients",
	method: 'GET',
	response: function (request){
		var response = { errors: [] };
		var account = ServerStore.getCollection('accounts').findOne({ token: request.data.token });

		if(!account) {
			response.errors.push({
				field: 'token',
				message: 'Token provided is invalid'
			});
		}

		if(response.errors.length === 0){
			this.status = 200;
			response.status = 'OK';
			response.results = [];

			var patients = ServerStore.getCollection('patients');
			account.patients.forEach(function(id){
				var patient = patients.findOne({_id: id});
				if(patient){
					response.results.push(patient);
				}else{
					console.warn('Could not find patient ' + id);
				}
			});
		}else{
			this.status = 401;
			response.status = 'Unauthorized';
		}

		this.responseText = response;
	}
});



// Fallback - Bypass Android bug with file:// and mockjax
window.Server = {};
Server.Authenticate = function(data,callback){
	var email = data.email,
		password = data.password,
		errors = [],
		response = {};

	if(email.length === 0){
		errors.push({
			field: 'email',
			message: 'Email cannot be blank'
		});
	}

	if(password.length === 0) {
		errors.push({
			field: 'password',
			message: 'Password cannot be blank'
		});
	}

	if(errors.length === 0){
		var account = ServerStore.getCollection('accounts').findOne({ email: email.toLowerCase() });
		if(account){
			if(account.password === password){
				account.token = 'ASItyUdF3WEfa4lkgASdDC';
				response.token = account.token;
				ServerStore.getCollection('accounts').update({_id: account._id}, account);
			}else{
				errors.push({
					field: 'password',
					message: 'Password is incorrect'
				});
			}
		}else{
			errors.push({
				field: 'email',
				message: 'Account does not exist'
			});
		}
	}

	if(errors.length === 0){
		response.status = 'OK';
		errors = null;
	}else{
		response.status = 'Unauthorized';
	}

	callback(errors, response)
};
Server.Patients = function(data,callback){
	var errors = [],
		response = {};
	var account = ServerStore.getCollection('accounts').findOne({ token: data.token });

	if(!account) {
		errors.push({
			field: 'token',
			message: 'Token provided is invalid'
		});
	}

	if(errors.length === 0){
		response.status = 'OK';
		response.results = [];
		errors = null;

		var patients = ServerStore.getCollection('patients');
		account.patients.forEach(function(id){
			var patient = patients.findOne({_id: id});
			if(patient){
				response.results.push(patient);
			}else{
				console.warn('Could not find patient ' + id);
			}
		});
	}else{
		response.status = 'Unauthorized';
	}

	callback(errors, response);
};

