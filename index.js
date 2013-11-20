var sphero = require("spheron").sphero();
var easing = require("easing");

var heading = 0;
var rollLen = 0;

var speed = 0x77;

var train = require("./train");

var controls = new train({
  left: function() {
    // setHeading alters Spheros reference heading
    // meaning 270 from current is now 0
    // this means post turn 0 will be forward
    sphero.setHeading(270);
    heading = 270;

    return this;
  },

  right: function() {
    sphero.setHeading(90);
    heading = 90;

    return this;
  },

  forward: function(len) {
    // async call, start queing commands
    this._startQueing();

    var self = this;

    console.log("forward %s", len);
    var ticks = 0;
    var ease = easing(30, "sin");
    ease = ease.concat(easing(30, "sin").reverse());

    var spd;
    function bump() {
      setTimeout(function() {
        spd = Math.round(ease[ticks++] * 255);
        sphero.roll(spd, heading, 2);
        if(ticks < ease.length) {
          bump();
        } else {
          self._stopQueing();
        }
      }, 15);
    }
    bump();

    return this;
  },

  setColor: function(color) {
    sphero.setRGB(color);
  },

  stop: function() {
    console.log("stop");
    sphero.roll(0x00, 0, 2);

    return this;
  }
});

module.exports = function(dev, s) {
  // override default speed, you want to change this value
  // depending on your surface. Higher (0xff max) for rougher surfaces
  // lower (0x00 min) for smoother, lower friction surfaces
  s && (speed = s);
  // connect with spheron
  sphero.open(dev);
  // wait for open or error
  sphero.on("open", function() {
    console.log("Sphero Connected");
    // run self leveling routine
    sphero.selfLevel(0,0,0);

    sphero.on("message", function(msg) {
      console.log(msg);
    });

    sphero.on("notification", function(msg) {
      // 0x06 is self leveling completed successful
      if(msg.DATA[0] === 0x06) {
        // reenable stablilization
        sphero.setStabalisation(0x01);
        // set rotate to slow XXX doesn't appear to work
        sphero.setRotationRate(0x00);
        // errrr, forget what this is for
        sphero.setTemporaryOptionFlags(0x01);
        // enable back led
        sphero.setBackLED(0xff);

        console.log("Calibration Successful");
        // start sequencing queued commands
        controls._stopQueing();

        controls.emit("ready");
      }
    });
  });

  // queue commands until Spheron connects
  controls._startQueing();

  // propate sphero errors to control
  sphero.on("error", function(err) {
    controls.emit("error", err);        
  });

  return controls;
};

module.exports.sphero = sphero;
