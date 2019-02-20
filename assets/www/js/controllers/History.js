/**
 * Created by Xenios Hadjimichael, xh00041.
 */


var HistoryController = Router.createController({

    title: 'History',

    template: document.querySelector('template[name="history"]'),

    onAfterRender: function() {
        var $past = $('#past'),
            bookings = Store.getCollection('bookings').find({}),
            listItemBuilder = function(booking){
                var $lis = $('<li/>')
                    .addClass('history-list')
                    .attr('key', booking._id);

                var $a = $('<a/>')
                    .one();

                var $row = $('<div/>')
                    .addClass('row');

                var $cols2 = $('<div/>')
                    .addClass('col s2');

                var $cols10 = $('<div/>')
                    .addClass('col s10');

                var $cols13 = $('<div/>')
                    .addClass('col s2');

                var $avatar = $('<div/>')
                    .addClass('avatar')
                    .html('<i class="fa fa-user"></i>');

                var $title = $('<span/>')
                    .addClass('title has-subtitle')
                    .text(booking.patient.forename + ' ' + booking.patient.surname );


                var $t ;
                if(booking.completed == true){
                    $t= "clocked-in ✔";
                }else{
                   $t ="";
                }
                var $tick = $('<span/>')
                    .addClass('tick')
                    .text($t);

                var $subtitle = $('<span/>')
                    .addClass('subtitle')
                    .text(moment(booking.date).calendar());

                $cols2.append($avatar);
                $cols10.append($title).append($subtitle).append($tick);
                $row.append($cols2).append($cols10);
                $a.append($row);
                $lis.append($a);

                return $lis;
            };

		var dateToday = moment('0:00am', 'h:mma');
        var past = bookings
			.filter(function(booking){
				return moment(booking.date).isBefore(dateToday) || booking.completed === true;
			})
			.map(listItemBuilder);

        $past.html(past);
    }
});
