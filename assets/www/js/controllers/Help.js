/**
 * Created by Brandon Hardy
 */


var HelpController = Router.createController({
    //page title
    title: 'Help',

    //page template
    template: document.querySelector('template[name="help"]'),

	onBeforeRender: function(){
		if(this.props.secure){
			this.props.$nav = $('#navbar');
			this.props.$navBtn = this.props.$nav.find('.button-collapse');
			this.props.$nav.addClass('text-center');
			this.props.$navBtn.hide();
		}
	},

    onAfterRender: function(){
		if(this.props.secure){
			$('#return').show();
		}
		$('.collapsible').collapsible();
    },

	onDestroy: function(){
		if(this.props.secure){
			this.props.$nav.removeClass('text-center');
			this.props.$navBtn.show();
		}
	}
});