/**
 * Booking Controller
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

var BookingController = Router.createController({
    // Page title
    title: 'Booking',

    // Navbar buttons for view
	navBar: function(){
		return [{
			title: 'Remove',
			onClick: function(event){
				$(event.target).off(); // Important to unbind events not to get memory leaks
				Store.getCollection('bookings').remove({_id: this.props._id});
				Router.go('/schedule');
			}
		},{
			title: this.props.booking.clockedIn ? 'Clock Out' : 'Clock In',
			onClick: function(event){
				var booking = this.props.booking,
					clockedIn = this.props.booking.clockedIn,
					session = Store.getCollection('session').findOne({});

				session.isScanning = true;
				Store.getCollection('session').update({_id: session._id}, session);

				try{
					this.showQRReader(function(result){
						session.isScanning = false;
						Store.getCollection('session').update({_id: session._id}, session);
						if(result.value == booking.patient._id){
							if(clockedIn == true){
								$(event.target).off().remove();
								booking.completed = true;
							}else{
								$(event.target).text('Clock Out');
								booking.clockedIn = true;
							}
							Store.getCollection('bookings').update({_id: booking._id}, booking);
							Materialize.toast('Success', 3000, 'toast-success');
						}else if(result.value != booking._id){
							Materialize.toast('QR did not match patient record', 3000, 'toast-error');
						}
					});
				}catch(error){
					Materialize.toast('Ops something went wrong', 3000, 'toast-error');
				}
			}
		}];
	},

    // Page template
    template: document.querySelector('template[name="booking"]'),

	showQRReader: function(callback){
		var API_KEY = 'eyJzY29wZSI6WyJBTEwiXSwicGxhdGZvcm0iOlsiaU9TIiwiQW5kcm9pZCIsIldpbmRvd3MiXSwidmFsaWQiOiIyMDE3LTA0LTE5IiwibWFqb3JWZXJzaW9uIjoiMyIsImlzQ29tbWVyY2lhbCI6ZmFsc2UsInRvbGVyYW5jZURheXMiOjYwLCJpb3NJZGVudGlmaWVyIjpbImNvbS5jb20yMDI3LmNhcmVycGFkIl0sImFuZHJvaWRJZGVudGlmaWVyIjpbImNvbS5jb20yMDI3LmNhcmVycGFkIl0sIndpbmRvd3NJZGVudGlmaWVyIjpbImNvbS5jb20yMDI3LmNhcmVycGFkIl19ClpGWTUyelNJZUdSWmx5cWxWWVR1RWIrNjBiV2UzUnF5MVJXMTNBcjJqRFZldXFocjNaU1Y4K3JickZvTzZDM21LeExGNWl3bXJtYXJvYkxONHp3eVY1MTF1RnNyY3gzVXBJUzRyc2JjSVlhQ25TUnFSZXV3ODNtaDI4TFNMcllTcStTYUY0VXYwM0I5cVpwc01raGpyTXU1SHZtK092K1lnWmMzNDJybUtNS1ZublFVQnlpdGd2QzFqTWdsS3RJTVpkdjlZOXl2Q1NrVVJkbFAxMExPNnM3TE4zMExOUjRRU3Iva2NocC9rVlpBMG9kQ0U3OGNoTDdXMzhYcm9lZ0tXd21hT2R3TTJFNzVnVzc1S3RaUFF4R0F0d1VicTZNU0kvZ1FJa2k0RC9scFd0TDhvaEhhRHBPMlhuVkIrVU0rTUpjQzZtRzB0UVBuR2FjVGNYb295QT09';
		var config = [
			API_KEY,
			{
				"cutout": {
					"style": "rect",
					"maxWidthPercent": "80%",
					"maxHeightPercent": "80%",
					"alignment": "center",
					"ratioFromSize": {
						"width": 100,
						"height": 80
					},
					"strokeWidth": 4,
					"cornerRadius": 10,
					"strokeColor": "FFFFFF",
					"outerColor": "000000",
					"outerAlpha": 0.3
				},
				"blinkAnimationOnResult": true,
				"cancelOnResult": true
			}
		];
		var onResult = function(result){
				callback(result);
			},
			onError = function(result){
				console.error(result);
				callback({})
			};

		cordova.exec(onResult, onError, "AnylineSDK", "BARCODE", config);
	},

	buildListItem: function(uppercase, icon, title, subtitle, href){
		var $li = $('<li/>')
			.addClass('list-item');

		var $a = $('<a/>');


		if(href){
			if(href.indexOf('tel:') === 0){
				$a.attr('href', href);
			}else{
				$a.one('click', function(){ Router.go(href) });
			}
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

	onBeforeRender: function(){
		this.props.booking = Store.getCollection('bookings').findOne({ _id: this.props._id });
	},

    onAfterRender: function(){
		var $header = $('#header'),
			$secure = $('#secure'),
			$maps = $('#maps'),
			booking = this.props.booking;

		// Google Static Map
		var src = 'https://maps.googleapis.com/maps/api/staticmap?',
			API_KEY = 'AIzaSyBKh33bYpbZtxDUAbivInOLevphOA2FeZE',
			screen = window.screen;

		var location = booking.patient.location;

		src += 'size=' + screen.width + 'x' + 125;
		src += '&zoom=' + 15;
		src += '&center=' + location;
		src += '&markers=color:red%7C' + location;
		src += '&scale=2';
		src += '&key=' + API_KEY;
		$maps.find('img').attr('src', src);
		$maps.find('a').attr('href', 'http://maps.google.com/maps?q=' + location);


		$header
			.append(
				this.buildListItem(
					true,
					'user',
					booking.patient.forename + ' ' + booking.patient.surname
				)
			)
			.append(
				this.buildListItem(
					false,
					'clock-o',
					moment(booking.date).calendar()
				)
			);

		$secure
			.find('#call')
			.find('a')
			.attr('href', 'tel:' + booking.patient.telephone)
			.find('.subtitle')
			.text(booking.patient.telephone);

		$secure
			.find('#call')
			.find('a')
			.attr('href', 'tel:' + booking.patient.telephone)
			.find('.subtitle')
			.text(booking.patient.telephone);

		$('#feedback')
			.val(booking.feedback)
			.on('blur', function(event){
				booking.feedback = event.target.value;
				Store.getCollection('bookings').update(booking._id, booking);
				Materialize.toast('Feedback saved', 3000, 'toast-success');
			})
    }
});
