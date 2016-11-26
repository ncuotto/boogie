var capture;
var width, height;

var counts_window = [];

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
      var i = y * width + x;
      var r = capture.pixels[i];
      var g = capture.pixels[i+1];
      var b = capture.pixels[i+2];
      if (r > 150 && g > 150 & b > 150)
        counts[i]++;
    }
  }

  // Debug, plot the histogram
  for (var x = 0; x < width; x++) {
    ellipse(x, height-counts[i], 2, 2);
  }

  // Add counts to sliding window
  counts_window.push([n, counts]);

  // Remove counts older than 5 seconds
  for(var i = counts_window.length-1; i >= 0 ; i--){
    if(n - counts_window[i][0] > 5000) {
      counts_window.splice(i, 1);
    }
  }

  // Every now and then we should pass this to the function that detects BPM
}
