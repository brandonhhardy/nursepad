/**
 * Logout Controller
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

var LogoutController = Router.createController({
	title: 'Signing out...',

	template: '<template></template>',

	onBeforeRender: function(){
		var session = Store.getCollection('session').findOne({});

		if(session){
			Store.removeCollection('session');
			Store.encrypt(session.password);
		}

		Router.go('/');
	}

});
