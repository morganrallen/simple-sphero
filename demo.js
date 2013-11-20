var keypress = require("keypress");
keypress(process.stdin);

try {
  process.stdin.setRawMode(true);
} catch(e) {
  console.log("Could not set stdin to raw mode, using nodemon?");
};

var port = process.env.SPHERO_DEV || process.argv[2];

if(!port) {
  console.log("Provide serial port to attach to");
  console.log("run with");
  console.log("SPHERO_DEV=/dev/rfcommX node demo.js");
  console.log("or");
  console.log("node demo.js /dev/rfcommX");

  process.exit(1);
}

var simple = require("./index")(port, 0x77);

var stage = 0;

simple.stop();

function randomColor() {
  return Math.round(Math.random() * 254);
}

simple.on("ready", function() {
  process.stdin.on("keypress", function(ch, key) {
    if(key && key.name === 'up') {
      simple.forward();
    }
    
    if(key && key.name === 'left') {
      simple.left();
    }
    
    if(key && key.name === 'right') {
      simple.right();
    }

    if(key && key.name === 'c') {
      simple.setColor(randomColor() * randomColor() * randomColor());
    }

    if(key && key.name === 't') {
      simple.toggleBackLight();
    }

    if(key && key.ctrl && key.name === 'c') {
      process.nextTick(function() {
        process.exit(1);
      });
    }

    usage();
  });

  usage();

  return;
  var repl = require("repl").start("> ");
  ["left", "right", "forward", "stop"].forEach(function(cmd) {
    if(typeof simple[cmd] === "function")
      repl.context[cmd] = simple[cmd].bind(simple);
    else repl.context[cmd] = simple[cmd];
  });
  repl.context.simple = simple;
}).on("error", function(err) {
  console.log("an error occured");
  console.log(err);
});

function usage() {
  console.log("");
  console.log("   simple-sphero");
  console.log("   [BATTERY: " + simple.power + "]");
  console.log("   c - change color!");
  console.log("   t - toggle backlight");
  console.log("   up - drive forward");
  console.log("   left - turn 90° left");
  console.log("   right - turn 90° right");
  console.log("");
}
