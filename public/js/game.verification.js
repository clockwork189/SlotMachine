(function($){

    if(!Game) return;

    var _form = null;

    Game.Verify = {

        init: function(){

            _form = $('#form-verify');

            //see http://jqueryvalidation.org/ for documentation
            //needs tuning
            $.fn.validate && _form.validate({
                ignore: ".ignore",
                errorElement: "p",
                errorPlacement: function(error, element) {
                    error.appendTo(element.parent());
                }
            });

            $('input[name=method]').on('click', function(){
                var value = this.value;
                if(value == 'cc' && this.checked) {
                    $('.paypal').addClass('hidden');
                    $('.cc').removeClass('hidden');
                } else if(value == 'paypal' && this.checked) {
                    $('.paypal').removeClass('hidden');
                    $('.cc').addClass('hidden');
                }
            });

        }

    }

    $(document).ready(Game.Verify.init);


}(jQuery))