/**
 * Patient Controller
 *
 * @author Charlie Tizzard ct00162@surrey.ac.uk
 */

var PatientController = Router.createController({
    // Page title
    title: 'Patient',

	navBar: [
		{
			title: 'Add Booking',
			onClick: function(event){
				$(event.target).off(); // Important to unbind events not to get memory leaks
				Router.go('/bookings/create', { _id: this.props._id });
			}
		}
	],

    // Page template
    template: document.querySelector('template[name="patient"]'),


	buildListItem: function(uppercase, icon, title, subtitle, href){
		var $li = $('<li/>')
			.addClass('list-item');

		var $a = $('<a/>');

		if(href){
			$a.one('click', function(){ Router.go(href) });
		}

		var $row = $('<div/>')
			.addClass('row');

		var $cols2 = $('<div/>')
			.addClass('col s2');

		var $cols10 = $('<div/>')
			.addClass('col s10');

		var $avatar = $('<div/>')
			.addClass('avatar')
			.html('<i class="fa fa-' + icon + '"></i>');

		var $title = $('<span/>')
			.addClass('title' + (subtitle ? ' has-subtitle': '') + (!uppercase ? ' text-capitalize' : ''))
			.text(title);

		if(subtitle) {
			var $subtitle = $('<span/>')
				.addClass('subtitle')
				.text(subtitle);
		}

		$cols2.append($avatar);
		$cols10.append($title);
		if(subtitle) {
			$cols10.append($subtitle);
		}
		$row.append($cols2).append($cols10);
		$a.append($row);
		$li.append($a);

		return $li;
	},



    // Logic to call after html is rendered
    onAfterRender: function(){
		var $header = $('#header'),
			$secure = $('#secure'),
			patient = Store.getCollection('patients').findOne({ _id: this.props._id });

		$header
			.append(
				this.buildListItem(
					true,
					'user',
					patient.forename + ' ' + patient.surname,
					patient.telephone
				)
			);

		$secure
			.append(
				this.buildListItem(
					false,
					'home',
					'Patient Details'
				)
			)
			.append(
				this.buildListItem(
					false,
					'folder',
					'Patient File',
					'Security Protected'
				)
			)
			.append(
				this.buildListItem(
					false,
					'cart-plus',
					'Equipment'
				)
			)
    }
});
