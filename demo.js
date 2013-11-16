var port = process.env.SPHERO_DEV || process.argv[2];

if(!port) {
  console.log("Provide serial port to attach to");
  console.log("run with");
  console.log("SPHERO_DEV=/dev/rfcommX node demo.js");
  console.log("or");
  console.log("node demo.js /dev/rfcommX");

  process.exit(1);
}

var simple = require("./index")(port, 0xff);

var stage = 0;
setInterval(function() {
  stage++;
  switch(stage % 2) {
    case 0:
      return simple.forward(1);
    case 1:
      return simple.right();
    case 2:
      return simple.stop();
  }
}, 3000);
