/**
 * Schedule Controller
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

var ScheduleController = Router.createController({
	// Page title
	title: 'Schedule',

	// Navbar buttons for view
	navBar: [
		{
			title: 'Add Booking',
			onClick: function(event){
				$(event.target).off(); // Important to unbind events not to get memory leaks
				Router.go('/bookings/create');
			}
		}
	],

	// Page template
	template: document.querySelector('template[name="schedule"]'),

	onAfterRender: function() {
		var $today = $('#today'),
			$tomorrow = $('#tomorrow'),
			$other = $('#other'),
			bookings = Store.getCollection('bookings').find({ completed: false }),
			listItemBuilder = function(booking){
				var $li = $('<li/>')
					.addClass('list-item')
					.attr('key', booking._id);

				var $a = $('<a/>')
					.one('click', function(){ Router.go('/bookings', { _id: booking._id }) });

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
					.addClass('title has-subtitle')
					.text(booking.patient.forename + ' ' + booking.patient.surname);

				var $subtitle = $('<span/>')
					.addClass('subtitle')
					.text(moment(booking.date).calendar());

				$cols2.append($avatar);
				$cols10.append($title).append($subtitle);
				$row.append($cols2).append($cols10);
				$a.append($row);
				$li.append($a);

				return $li;
			},
			sortByDate = function(a,b){
				return new Date(a.date).getTime() > new Date(b.date).getTime();
			};

		var dateToday = new Date(),
			dateTomorrow = new Date(dateToday.getTime() + 24 * 60 * 60 * 1000);

		var today = bookings
			.filter(function(booking){ return moment(new Date(booking.date)).isSame(new Date(), 'd') })
			.sort(sortByDate)
			.map(listItemBuilder);
		var tomorrow = bookings
			.filter(function(booking){ return moment(new Date(booking.date)).isSame(dateTomorrow, 'd') })
			.sort(sortByDate)
			.map(listItemBuilder);
		var other = bookings
			.filter(function(booking){ return moment(new Date(booking.date)).diff(dateTomorrow) > 0 })
			.sort(sortByDate)
			.map(listItemBuilder);



		$today.html(today);
		$tomorrow.html(tomorrow);
		$other.html(other);
	}
});
