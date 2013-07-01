//Slot Object
var Slot = function (coord_x, coord_y) {
    this.x = coord_x;
    this.y = coord_y;
    this.width = 180;
    this.height = 243;
    this.sx = 0;
    this.sy = 0;
    this.swidth = 180;
    this.sheight = 243;
};

var SlotMachine = function () {
    var canvas = document.getElementById('slots');
    var context = canvas.getContext('2d');
    var imgSrcs = {
        slots: "/javascripts/img/slots.png"
    };
    var imgs = [];
    var gameStates = ["Not Started", "Playing", "Game Ended"];
    var playerStates = ["Win", "Lose"];
    var coordinates = {
        left: {
            x: 0,
            y: 0
        },
        center: {
            x: 180,
            y: 0
        },
        right: {
            x: 360,
            y: 0
        }
    };

    self.init = function  (argument) {
        loadImages(imgSrcs, function(images) {
            renderImages();
            drawImages(images);
            animateImages(images);
        });
    };
    var renderImages = function () {
        var left_slot = new Slot(coordinates.left.x, coordinates.left.y);
        var center_slot = new Slot( coordinates.center.x, coordinates.center.y);
        var right_slot = new Slot(coordinates.right.x, coordinates.right.y);

        imgs.push(left_slot);
        imgs.push(center_slot);
        imgs.push(right_slot);
    };
    var drawImages = function (images) {
        for(var i = 0; i < imgs.length; i++) {
            context.drawImage(images.slots,
                imgs[i].sx,
                imgs[i].sy,
                imgs[i].width,
                imgs[i].height,
                imgs[i].x,
                imgs[i].y,
                imgs[i].swidth,
                imgs[i].sheight);
        }
    };
    var animateImages = function (images) {
        for(var i = 0; i < imgs.length; i++) {
            context.drawImage(images.slots,
                imgs[i].sx,
                imgs[i].sy,
                imgs[i].width,
                imgs[i].height,
                imgs[i].x,
                imgs[i].y,
                imgs[i].swidth,
                imgs[i].sheight);

        }
    };
    var initAnimationFrames = function () {
        // Gets Animated Frames from the browser
        window.requestAnimationFrame = (function () {
              return  window.requestAnimationFrame       ||
                      window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame    ||
                      window.oRequestAnimationFrame      ||
                      window.msRequestAnimationFrame     ||
                      function(/* function */ callback, /* DOMElement */ element){
                        window.setTimeout(callback, 1000 / 60);
                      };
        })();
    };

    //A simple random generator
    var random = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    var loadImages = function (sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        // get num of sources
        for(var src in sources) {
            numImages++;
        }
        for(var src in sources) {
            images[src] = new Image();
            images[src].onload = function() {
                imgs.push(images[src]);
                if(++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[src].src = sources[src];
        }
      }

    return self;
};


var slots = new SlotMachine();
slots.init();