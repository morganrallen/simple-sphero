simple-sphero
======

Implements very basic controls for Sphero.

example
------
```
var simple = require("simple-sphero")(/path/to/dev, 0xSPEED);

simple.left();
simple.forward(1);
```

This will turn left and go forward for 1 second.

Chainable
---------
```
simple
  .left()
  .forward(1)
  .left()
  .forward(1)
  .right()
  .forward(1);
  .right()
  .forward(1)
  .stop();
```

The chaining automatically takes care of asyncing calls after `forward(n)` for `n` time.
