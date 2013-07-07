var Slots = function (prizes) {
    var self = {};
    var prizes = prizes || [];
    var canvas = document.getElementById("slots");
    var context = canvas.getContext("2d");
    var tiles_images = [];
    var slotState = {
        "Stopped": 0,
        "Spinning" : 1,
        "Finished": 2
    };
    var delay = 200;

    var reels = [];
    var initialReels = [0, 0, 0];
    var result = [1, 5, 9];
    var width = 179;
    var height = 220;
    self.isSpinning = false;

    var duration = 1000;
    var startTime = 0;

    self.init = function () {
        self.drawBackground();
        loadImages(prizes);
    };

    var loadImages = function (sources) {
        var loadedImages = 0, numImages = sources.length, images = [], image = {};
        if(numImages > 0) {
            for (var i = 0; i < numImages; i++) {
                images[i] = new Image();
                images[i].onload = function() {
                    loadedImages += 1;
                    if(loadedImages === numImages) {
                        tiles_images = images;
                        drawImages();
                    }
                };
                images[i].src = sources[i].image_url;
            }
        }
    };

    var drawImages = function () {
        var tile1 = new Tile(0, 0, initialReels[0], tiles_images[0]);
        var tile2 = new Tile(180, 0, initialReels[1], tiles_images[1]);
        var tile3 = new Tile(360, 0, initialReels[2], tiles_images[2]);

        context.drawImage(tile1.image, tile1.x, tile1.y, tile1.width, tile1.height);
        context.drawImage(tile2.image, tile2.x, tile2.y, tile2.width, tile2.height);
        context.drawImage(tile3.image, tile3.x, tile3.y, tile3.width, tile3.height);

        reels.push(tile1);
        reels.push(tile2);
        reels.push(tile3);
    };

    self.update = function () {
        for(var i = 0; i < reels.length; i++) {
            var tile = reels[i];
            context.drawImage(tile.image, tile.x, tile.y, tile.width, tile.height);
            if(self.isSpinning) {
                var prize = result[i];
                startTime++;
                tile.y += 5;
                var nextTile = (tile.id === tiles_images.length ? 1 : tile.id + 1);
                context.drawImage(tiles_images[nextTile - 1], tile.x, tile.y - height);
                if((tile.y - height) >= 0) {
                    tile.id = nextTile;
                    tile.image = tiles_images[nextTile - 1];
                    tile.y = 0;
                }
                if(startTime > duration) {
                    if(tile.id === prize) {
                        tile.y = 0;
                    }
                }
            }
        }
        checkAllTilesStopped();
    };
    var checkAllTilesStopped = function () {
        var counter = 0;
        for(var i = 0; i < reels.length; i++) {
            var tile = reels[i];
            if(tile.id === result[i]) {
                counter++;
            }
            if(counter === 3) {
                delay -= 1;
                if(delay < 0) 
                if(delay === 0) {
                    self.isSpinning = false;
                    startTime = 0;
                    delay = 300;
                }
            }
        }
    };
    var generateRandomTile = function (currId, min, max) {
        var rand = Math.round(Math.random() * (max - min) + min);
        if(currId === rand || currId === undefined) {
            generateRandomTile(currId, min, max);
        } else {
            return rand;
        }
    };

    self.drawBackground = function () {
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#5d1f11';
        context.fill();
    };

    self.spin = function (prizes) {
        self.isSpinning = true;
        result = prizes;
    };

    return self;
};

var Tile = function (x, y, id, img) {
    this.x = x;
    this.y = y;
    this.width = 179;
    this.height = 221;
    this.id = id;
    this.image = img;
};

var Game = function (kwargs) {
    var self = {};
    kwargs = kwargs || {};
    var user = kwargs.user || {};
    var settings = kwargs.settings || {};
    var endDate = new Date(settings.promotion_end_date) || null;
    var numPlays = parseInt(user.numberSpins, 10) || 0;
    var prizes = kwargs.prizes || [];
    var availablePrizesToday = settings.max_number_prizes_per_day || 0;
    var awardedPrizes = 0;
    var isRunning = false;
    var awardPrize = false;
    var slots;
    var result = [1, 2, 3];
    var imageSources = {
        tile_1: "javascripts/img/tile_1.png",
        tile_2: "javascripts/img/tile_2.png",
        tile_3: "javascripts/img/tile_3.png",
        tile_4: "javascripts/img/tile_4.png",
        tile_5: "javascripts/img/tile_5.png",
        tile_6: "javascripts/img/tile_6.png",
        tile_7: "javascripts/img/tile_7.png",
        tile_8: "javascripts/img/tile_8.png",
        tile_9: "javascripts/img/tile_9.png",
        tile_10: "javascripts/img/tile_10.png",
        tile_11: "javascripts/img/tile_11.png"
    };

    self.init = function () {
        isRunning = true;
        initializeSlots();
        listenToPlayButton();
        listenToEarnSpinsButton();
        setSpins();
        loop();
    };
    var initializeSlots = function () {
        slots = new Slots(prizes);
        slots.init();
    };
    var setSpins = function () {
        var digits = numPlays.toString().split('');
        for(var i=digits.length - 1; i >=0; i--) {
            var spinsLeft = 3 - parseInt(i, 10);
            $(".spins_left .count:eq(" + spinsLeft + ")").text(digits[i]);
        }
    };
    var listenToEarnSpinsButton = function () {
        $(".earnMoreSpins").click(function() {
            if(kwargs.user === undefined) {
                //alert("You must sign up or login to play");
                $('#signup').modal();
            } else {
                window.location = "/earnmorespins";
            }
        });
    };
    var listenToPlayButton = function () {
        $("#play").click(function() {
            var today = new Date();
            if(endDate < today){
                $('#ended').modal();
            } else if(kwargs.user === undefined) {
                $('#signup').modal();
            } else if(numPlays > 0) {
                if(slots.isSpinning === false) {
                    var res = calculatePrize();
                    numPlays -= 1;
                    user.numberSpins = numPlays;
                    setSpins();
                    $.ajax({
                        type: "POST",
                        url:"/post/update/player",
                        data: user,
                        dataType: "json",
                        success:function(result){

                        }
                    });
                    slots.spin(res);
                }
            } else {
                $('#nospinsleft').modal();
            }
        });
    };
    var calculatePrize = function() {
        var slotArray = [];
        for(var i = 0; i < 3; i++) {
            slotArray[i] = random(1, 11);
        }
        checkVictory(slotArray[0], slotArray[1], slotArray[2]);
        return slotArray;
    };
    var checkVictory = function (slot1, slot2, slot3) {
        if(slot1 === slot2 === slot3) {
            var prize_won = prizes["prize_" + slot1];
            if(awardedPrizes >= availablePrizesToday) {
                calculatePrize();
            }
        }
        result[0] = slot1;
        result[1] = slot2;
        result[2] = slot3;
        didPlayerWin();
    };
    //A simple random generator
    var random = function (min, max) {
        return Math.round(Math.random() * (max - min) + min);
    };
    var didPlayerWin = function () {
        if(result[0] === result[1] === result[2]) {
            if(slot.isSpinning ===false) {
                $("#youwon").modal();
                var data = {
                    usr: user,
                    prize: result[0]
                };
                $.ajax({
                    type: "POST",
                    url:"/post/add/winner",
                    data: data,
                    dataType: "json",
                    success:function(result){

                    }
                });
            }
        }
    };
    var loop = function () {
        slots.drawBackground();
        slots.update();
        requestAnimFrame(loop);
    };

    return self;
};

window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();