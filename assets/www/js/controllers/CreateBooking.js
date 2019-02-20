/**
 * Create Booking Controller
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

var CreateBookingController = Router.createController({
	// Page title
	title: 'New Booking',

	// Page template
	template: document.querySelector('template[name="create-booking"]'),

	/**
	 * Processes the Create Booking form
	 */
	onSubmit: function(event){
		event.preventDefault();
		var form = event.target;

		// Extract input values
		var date = form.date.value,
			time = form.time.value,
			patient = form.patient.value,
			recurring = form.recurring.checked;

		check(date, 'String');
		check(time, 'String');
		check(patient, 'String');
		check(recurring, 'Boolean');

		if(date.length == 0){
			return Materialize.toast('Please specify a date', 3000, 'toast-error');
		}
		if(time.length == 0){
			return Materialize.toast('Please specify a time', 3000, 'toast-error');
		}

		patient = Store.getCollection('patients').findOne({_id: patient});

		if(patient == null){
			return Materialize.toast('Invalid patient, please refresh application', 3000, 'toast-error');
		}

		var id = Store.getCollection('bookings')
			.insert({
				patient: patient,
				date: date + 'T' + time,
				time: date + 'T' + time,
				recurring: recurring,
				clockedIn: false,
				completed: false,
				feedback: ''
			});

		if(id){
			Materialize.toast('Success', 3000, 'toast-success');
			Router.go('/schedule');
		}else{
			Materialize.toast('Failed to create booking', 3000, 'toast-error');
		}
	},

	onAfterRender: function(){
		var patients = Store.getCollection('patients').find({}),
			$list = $('select#patients'),
			html = [];

		if(this.props._id) {
			var patient = patients.filter(function (a) {
				return a._id == this.props._id
			}, this)[0];
		}

		if(patient){
			var $li = $('<option/>')
				.val(patient._id)
				.text(patient.forename + ' ' + patient.surname);
			html.push($li);
		}else{
			patients.forEach(function(patient){
				var $li = $('<option/>')
					.val(patient._id)
					.text(patient.forename + ' ' + patient.surname);
				html.push($li);
			});
		}

		// Populate patients Drop-down
		$list.html(html);
		// Initialise Drop-down
		$list.material_select();

		// Listen for form submit event
		$('#create-booking').on('submit', this.onSubmit);
	}
});
