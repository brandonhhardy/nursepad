/**
 * Login Controller
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

var LoginController = Router.createController({
	title: 'NursePad',

	template: document.querySelector('template[name="login"]'),

	onSubmit: function(event){
		event.preventDefault();

		if(!this.props.online){
			return Materialize.toast('No internet connection detected', 5000, 'toast-error');
		}

		var email = event.target.email.value,
			password = event.target.password.value;

		$.post('/api/authenticate', { email: email, password: password }, null, 'json')
			.done(function(response){
				Store.getCollection('session').remove({}).insert({ token: response.token, password: password });
				Store.decrypt(password);
				Store.restoreStore();

				/**
				 * Sync patients with server
				 *
				 * Could be return by the authentication response but
				 * this way things are explicit
				 */
				var collection = Store.getCollection('patients');
				$.post('api/patients', { token: response.token },function (response) {
					if(response.status === 'OK'){
						collection.remove({});
						response.results.forEach(function(patient){
							collection.insert(patient);
						});
					}
				}, 'json');

				Router.go('/schedule');
			})
			.fail(function(xhr){
				if(xhr.status === 401){
					var response = JSON.parse(xhr.responseText);
					response.errors.forEach(function(error){
						Materialize.toast(error.message, 5000, 'toast-error');
					});
				}

				if(xhr.status === 404){
					console.warn('Mockjax error, falling back to vanilla JS.');
					// Fallback
					Server.Authenticate({ email: email, password: password }, function(errors,response){

						if(errors){
							errors.forEach(function(error){
								Materialize.toast(error.message, 5000, 'toast-error');
							});
							return;
						}

						Store.getCollection('session').remove({}).insert({ token: response.token, password: password });
						Store.decrypt(password);
						Store.restoreStore();

						var collection = Store.getCollection('patients');
						Server.Patients({ token: response.token }, function(error, response){
							if(response.status === 'OK'){
								collection.remove({});
								response.results.forEach(function(patient){
									collection.insert(patient);
								});
							}
						});

						Router.go('/schedule');
					});
				}
			});
	},

	onBeforeRender: function(){
		this.props.navbar = $('#navbar');
		this.props.navbar.find('> .nav-wrapper').addClass('text-center');
		this.props.navbar.find('a.button-collapse').hide();
		this.props.online = true;
	},

	onAfterRender: function(){
		$('form#login').on('submit', this.onSubmit.bind(this));
	},

	onDeviceOnline: function(){
		this.props.online = true;
	},

	onDeviceOffline: function(){
		this.props.online = false;
	},

	onDestroy: function(){
		this.props.navbar.find('> .nav-wrapper').removeClass('text-center');
		this.props.navbar.find('a.button-collapse').show();
	}
});
