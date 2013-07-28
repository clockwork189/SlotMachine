(function($){

	var Game = {
		init: function(){
            $.fn.jcarousel && $('#winners-carousel ul').jcarousel({
                scroll: 1
            });

            if(window.ZeroClipboard) {
                $('[data-clipboard-text]').each(function(){
                    var clip = new ZeroClipboard( this, {
                        moviePath: "./js/ZeroClipboard.swf"
                    });
                    clip.on( 'complete', function(client, args) {
                        //this.style.display = 'none'; // "this" is the element that was clicked
                        $(this).text('Done!');
                    });
                });
            }

            if($.fn.bootstrapSwitch) {
                $('.switch').on('switch-change', function (e, data) {
                    if(msg = $(this).attr('data-msg')) {
                        $(msg)[data.value ? 'removeClass' : 'addClass']('hidden');
                    }
                });
            }
		}
	}
	window.Game = Game;
}(jQuery));


(function($, $jf){

	var _channels = {},
		_view = {
			currentModal: null
		};

	var App = {
		init: function(){
			$('#jface').ready(function(){
				$jf.init();
				$jf.addWindows();
			});
			$(document).ready(function(){
				$(document).on('click', 'a[data-target=modal]', function(){
					var $this = $(this),
						url = this.href,
						split = $this.attr('data-modal-split'),
						h = $this.attr('data-modal-header');
					$.get(url, function(html){
						_view.currentModal && _view.currentModal.trigger('jw.close');
						$jf.showOverlay();
						$jw.open({
							split: split,
							contentHtml: html,
							headerHtml: h,	
							activateCallback: function(){
								_view.currentModal = this;
							}
							,closeCallback: function(){
								$jf.hideOverlay();
							}
						});
					}).fail(function(){
						//fail actions
					});
					return false;
				});
				Game && Game.init();
			});
		}

		/**
		 * Mediator pattern method
		 */
		,subscribe: function(channels, subscription){
			var a = channels.split(' '), i = a.length
				;
			while(i--) {
				if (!_channels[a[i]]) _channels[a[i]] = [];
				_channels[a[i]].push(subscription);
			}
		}

		/**
		 * Mediator pattern method
		 */
		,publish: function(channel){
			if (!_channels[channel]) return false;
			var args = Array.prototype.slice.call(arguments, 1);
			for (var i = 0, l = _channels[channel].length; i < l; i++) {
				var subscription = _channels[channel][i];
				if('function' == typeof subscription) {
					subscription.apply(this, args);
				} else if(subscription.callback) {
					subscription.callback.apply(subscription.context || this, args);
				}
			}
		}
	}
	
	window.App = App;

}(jQuery, jFace));


App.init();

