var Skeleton = function () {
    var self = {};
    self.init = function () {
        $("#signup_button").click(function() {
            $("#signupForm").submit();
        });
        $("#signin_button").click(function() {
            $("#signinform").submit();
        });
        getGameParams();
    };
    var getGameParams = function () {
         $.ajax({
            type: "POST",
            url:"/post/game/params",
            dataType: "json",
            success:function(result){
                var game = new Game(result);
                game.init();
            }
        });
    };
    return self;
};

var ske = new Skeleton();
ske.init();