$(document).ready(function(){
    var earnMore = new EarnMore();
    earnMore.init();
});

var EarnMore = function () {
    var self = {};
    var url = $("#shortURL").val();
    self.init = function () {
        initializeCopier();
        $(".facebook_invite").click(function() { openFacebookInvite(); });
        $(".twitter_invite").click(function() { openTwitterInvite(); });
        $(".googleplus_invite").click(function() { opengooglePlusInvite(); });
        // $(".email_invite").click(function() { openemailInvite(); });
        // $("#invite_emails").click(function() { sendEmailInvites(); });
        // $("#emails_to_invite").tagsInput({ 'defaultText':'Add emails' });
        getGameParams();
    };
    var setSpins = function (numPlays) {
        var digits = numPlays.toString().split('');
        console.log(digits);
        if(digits.length === 1) {
            $(".spins_left .count:eq(3)").text(digits[0]);
        } else if(digits.length === 2) {
            $(".spins_left .count:eq(3)").text(digits[1]);
            $(".spins_left .count:eq(2)").text(digits[0]);
        } else if(digits.length === 3) {
            $(".spins_left .count:eq(3)").text(digits[2]);
            $(".spins_left .count:eq(2)").text(digits[1]);
            $(".spins_left .count:eq(1)").text(digits[0]);
        } else if(digits.length === 4) {
            $(".spins_left .count:eq(3)").text(digits[3]);
            $(".spins_left .count:eq(2)").text(digits[2]);
            $(".spins_left .count:eq(1)").text(digits[1]);
            $(".spins_left .count:eq(0)").text(digits[0]);
        }
    };
    var getGameParams = function () {
        $.ajax({
            type: "POST",
            url:"/post/game/params",
            dataType: "json",
            success:function(result){
                setSpins(result.user.numberSpins);
            }
        });
    };
    var initializeCopier = function () {
        $('.copyurl').zclip({
            path:'/javascripts/ZeroClipboard.swf',
            copy: url,
            beforeCopy: function () {
                $(".copy_msg").show("slow");
            },
            afterCopy: function () {
                $(".copy_msg").hide("slow");
            }
        });
    };
    var openFacebookInvite = function () {
        FB.init({
            appId:'376845965748399',
            cookie:true,
            status:true,
            xfbml:true
        });
        FB.ui({
            title: 'Spin To Win',
            method: 'apprequests',
            message: 'Come over and play Spin To Win at theStore.com ' + url
        });
    };
    var openTwitterInvite = function() {
        $("#inviteModal").modal();
    };
    var opengooglePlusInvite = function() {
        $("#inviteModal").modal();
    };
    var openemailInvite = function() {
        $("#inviteEmailModal").modal();
    };
    var sendEmailInvites = function() {
        var emails = $('#emails_to_invite').val().split(",");
        var validEmails = [];
        var validateEmail = function (email) {
            var emailRegEx = /^([a-zA-Z0-9])(([a-zA-Z0-9])*([\._-])?([a-zA-Z0-9]))*@(([a-zA-Z0-9\-])+(\.))+([a-zA-Z]{2,4})+$/;
            if(email.search(emailRegEx)==-1) {
                // console.log("Invalid");
                return false;
            } else {
                // console.log("Valid");
                return true;
            }
        };
        for(var i = 0; i < emails.length; i++) {
            if(validateEmail(emails[i])) {
                validEmails.push(emails[i]);
            }
        }

        $.ajax({
                type: "POST",
                url:"/invite/email",
                data: {emails: validEmails},
                dataType: "json",
                success:function(result){

                }
            });
    };

    return self;
};