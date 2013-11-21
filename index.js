var sphero = require("spheron").sphero();
var easing = require("easing");

var heading = 0;
var rollLen = 0;

var speed = 0x77;

var train = require("./train");
var rollDuration = 15;

var backlightOn = true;

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
    var ease = easing(rollDuration, "sin");
    ease = ease.concat(easing(rollDuration, "sin").reverse());

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
  },

  toggleBackLight: function() {
    sphero.setBackLED((backlightOn = !backlightOn) ? 0x00 : 0xff);
  }
});

module.exports = function(dev, s, d) {
  // override default speed, you want to change this value
  // depending on your surface. Higher (0xff max) for rougher surfaces
  // lower (0x00 min) for smoother, lower friction surfaces
  s && (speed = s);
  d && (rollDuration = d);
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
      if(msg.ID_CODE === 0x0b && msg.DATA[0] === 0x06) {
        // reenable stablilization
        sphero.setStabalisation(0x01);
        // set rotate to slow XXX doesn't appear to work
        sphero.setRotationRate(0x00);
        // errrr, forget what this is for
        sphero.setTemporaryOptionFlags(0x01);
        // enable back led
        controls.toggleBackLight();

        // enable power notifications
        sphero.setPowerNotification(0x01);

        console.log("Calibration Successful");
        // start sequencing queued commands
        controls._stopQueing();

        controls.emit("ready");
      } else if(msg.ID_CODE === 0x01) {
        switch(msg.DATA[0]) {
          case 0x01: controls.power = "Charging";
          case 0x02: controls.power = "OK";
          case 0x03: controls.power = "Low";
          case 0x04: controls.power = "Critical";
        }
      }
    });
  });

  // queue commands until Spheron connects
  controls._startQueing();

  // propate sphero errors to control
  sphero.on("error", function(err) {
    controls.emit("error", err);        
  });

  controls.power = "Unkown";

  return controls;
};

module.exports.sphero = sphero;
