/**
 * Initial code entry
 */

// Initialise PocketJS
Store = Pocket.new();
Store.restoreStore();

// Router definitions
Router.route('/', LoginController);
Router.route('/logout', LogoutController);
Router.route('/bookings/create', CreateBookingController);
Router.route('/bookings/:count/create/:_id', CreateBookingController);
Router.route('/bookings/:_id', BookingController);
Router.route('/schedule', ScheduleController);
Router.route('/help', HelpController);
Router.route('/help/:secure', HelpController);
Router.route('/history', HistoryController);

// Register device status events
document.addEventListener("deviceready", function(){
	document.addEventListener("offline", function(){
		Materialize.toast('Lost internet connection', 5000, 'toast-error');
		Router.status('offline');
	}, false);
	document.addEventListener("online", function(){
		Materialize.toast('Internet connection restored', 5000, 'toast-success');
		Router.status('online');
	}, false);
	document.addEventListener("pause", function(){
		var session = Store.getCollection('session').findOne({});

		if(session.isScanning === true){
			return;
		}

		if(session){
			Store.removeCollection('session');
			Store.encrypt(session.password);
		}
		Router.go('/');
	}, false);
}, false);

// Page ready
$(function(){
	FastClick.attach(document.body);
	$(".button-collapse").sideNav({closeOnClick: true});
});