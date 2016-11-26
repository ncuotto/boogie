// p5.js movement detection and camera capture
//
// SETTINGS
// Threshold (80-255):
var threshold = 100;

var capture;
var width, height;

var counts_window = [];

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function setup() {
  width = 320;
  height = 240;
  createCanvas(width, height);
  capture = createCapture(VIDEO);
  capture.size(width, height);
}

function draw() {
  background(255);
  image(capture, 0, 0, 320, 240);
  capture.loadPixels();

  // Get the time in ms since 1970/01/01
  var d = new Date();
  var n = d.getTime();

  // Initialise histogram to zero
  counts = [];
  for (var x = 0; x < width; x++) {
    counts[x] = 0;
  }

  // Count the dark pixels for each column
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var i = y * width*4 + x *4;
      var r = capture.pixels[i];
      var g = capture.pixels[i+1];
      var b = capture.pixels[i+2];
      if (!(r > threshold && g > threshold & b > threshold))
        counts[x]++;
    }
  }

  // Moving average
  average_counts = [];
  for (var x = 0; x < width; x++) {
    // HAHA, it's a hackaton, no rules!
    average_counts[x] = 0;
    for(var w = -10; w < 10; w++) {
      average_counts[x] += counts[x+w];
    }
    average_counts[x] /= 21;
  }

  // Debug, plot the histogram
  // & Find the maximum
  var max_x = 0;
  var max_counts = 0;
  for (var x = 20; x < width-20; x++) {
    fill(255, 255, 255);
    ellipse(x, height-average_counts[x], 5, 5, 1);
    if (average_counts[x] > max_counts) {
      max_counts = average_counts[x];
      max_x = x;
    }
  }

  // Plot the maximum
  fill(255, 204, 0);
  ellipse(max_x, height-max_counts, 10, 10, 10);

  // Add counts to sliding window
  counts_window.push([n, max_x]);

  // Remove counts older than 5 seconds
  for(var i = counts_window.length-1; i >= 0 ; i--){
    if(n - counts_window[i][0] > 5000) {
      counts_window.splice(i, 1);
    }
  }

  // Every now and then we should pass this to the function that detects BPM
}
