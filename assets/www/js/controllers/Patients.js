/**
 * Patients Controller
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

var PatientsController = Router.createController({
	// Page title
	title: 'Patients',

	// Navbar buttons for view
	navBar: [
		{
			title: 'Sync Patients',
			onClick: function(event){
				$(event.target).off(); // Important to unbind events not to get memory leaks

				/**
				 * Sync patients with server
				 */
				var collection = Store.getCollection('patients');
				$.post('api/patients', { token: Store.getCollection('user').findOne({}).token },function (response) {
					if(response.status === 'OK'){
						collection.remove({}).commit();
						response.results.forEach(function(patient){
							collection.insert(patient);
						});
						Router.reload();
					}
				}, 'json');
			}
		}
	],

	// Page template
	template: document.querySelector('template[name="patients"]'),

	// Logic to call after html is rendered
	onAfterRender: function(){
		var $list = $('#patients'),
			patients = Store.getCollection('patients').find({}),
			html = [];

		patients.forEach(function(patient){
			var $li = $('<li/>')
				.addClass('list-item')
				.attr('key', patient._id);

			var $a = $('<a/>')
				.one('click', function(){Router.go('/patients', { _id: patient._id }) });

			var $row = $('<div/>')
				.addClass('row');

			var $cols2 = $('<div/>')
				.addClass('col s2');

			var $cols10 = $('<div/>')
				.addClass('col s10');

			var $avatar = $('<div/>')
				.addClass('avatar')
				.html('<i class="fa fa-user"></i>');

			var $title = $('<span/>')
				.addClass('title')
				.text(patient.forename + ' ' + patient.surname);

			$cols2.append($avatar);
			$cols10.append($title);
			$row.append($cols2).append($cols10);
			$a.append($row);
			$li.append($a);

			html.push($li);
		});

		$list.html(html);
	}
});
