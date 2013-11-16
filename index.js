var sphero = require("spheron").sphero();

var heading = 0;
var rollLen = 0;

var speed = 0x77;

var train = require("./train");
var controls = new train({
  left: function() {
    console.log("left");
    heading -= 90;
    heading < 0 && (heading = 360 + heading);

    return this;
  },

  right: function() {
    console.log("right");
    heading = (heading += 90) % 360;

    return this;
  },

  forward: function(len) {
    this._startQueing();

    var self = this;
    setTimeout(function() {
      self._stopQueing();
    }, len * 1000);

    console.log("forward %s", len);
    sphero.roll(speed, heading, 2);

    return this;
  },

  stop: function() {
    console.log("stop");
    sphero.roll(0x00, heading, 1);

    return this;
  }
});

module.exports = function(dev, s) {
  s && (speed = s);
  sphero.open(dev);
  sphero.on("open", function() {
    console.log("Sphero Connected");
    sphero.selfLevel(0,0,0);

    sphero.on("message", function(msg) {
    });

    sphero.on("notification", function(msg) {
      sphero.setStabalisation(0x01);
      sphero.setRotationRate(0x00);
      sphero.setTemporaryOptionFlags(0x01);
      sphero.setBackLED(0xff);

      if(msg.DATA[0] === 0x06) {
        console.log("Calibration Successful");
        controls._stopQueing();
      }
    });
  });

  controls._startQueing();

  return controls;
};


module.exports.sphero = sphero;
