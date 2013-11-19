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

simple.on("ready", function() {
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
