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
      if (!(r > 100 && g > 100 & b > 100))
        counts[x]++;
    }
  }

  // Debug, plot the histogram
  // & Find the maximum
  var max_x = 0;
  var max_counts = 0;
  for (var x = 20; x < width-20; x++) {
    fill(255, 255, 255);
    ellipse(x, height-counts[x], 5, 5, 1);
    if (counts[x] > max_counts) {
      max_counts = counts[x];
      max_x = x;
    }
  }

  // Plot the maximum
  fill(255, 204, 0);
  ellipse(max_x, height-max_counts, 10, 10, 10);

  // Add counts to sliding window
  counts_window.push([n, 9999999]);

  // Remove counts older than 5 seconds
  for(var i = counts_window.length-1; i >= 0 ; i--){
    if(n - counts_window[i][0] > 5000) {
      counts_window.splice(i, 1);
    }
  }

  // Every now and then we should pass this to the function that detects BPM
}
