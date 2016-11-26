// p5.js movement detection and camera capture
//
// SETTINGS
// Threshold (80-255):
var threshold = 20;

var capture;
var width, height;

var r_avgs = 0;
var g_avgs = 0;
var b_avgs = 0;

var counts_window = [];

var background_pixels = [];

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

  // When pixels are defined load background
  if (background_pixels.length == 0 && capture.pixels[0] > 0) {
    var d = pixelDensity();
    var max_i = 4 * (width * d) * (height * d);
    for (var i = 0; i < max_i; i++) {
      background_pixels.push(capture.pixels[i]);
    }
  }

  // Get the time in ms since 1970/01/01
  var d = new Date();
  var n = d.getTime();

  // Initialise histogram to zero
  counts = [];
  for (var x = 0; x < width; x++) {
    counts[x] = 0;
  }


  // Loop through all the pixels
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var i = y * width*4 + x *4;

      //var r = abs(pixels[i] - background_pixels[i]);
      //var g = abs(pixels[i+1] - background_pixels[i + 1]);
      //var b = abs(pixels[i+2] - background_pixels[i + 2]);
      var r = abs(capture.pixels[i] - background_pixels[i]);
      var g = abs(capture.pixels[i+1] - background_pixels[i + 1]);
      var b = abs(capture.pixels[i+2] - background_pixels[i + 2]);

      //console.log(r, g, b);
      //pixels[0] = 0;

      // Count the dark pixels for each column
      if ((r > threshold && g > threshold & b > threshold))
        counts[x]++;
      // if ((r-r_avgs > threshold && g-g_avgs > threshold & b-b_avgs > threshold))
    }
  }

  // Moving average
  average_counts = [];
  for (var x = 0; x < width; x++) {
    // HAHA, it's a hackaton, no rules!
    average_counts[x] = 0;
    for(var w = -10; w < 10; w++) {
      if (x+w >= 0 && x+w < width)
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

  for(var i = 0; i < counts_window.length; i++) {
    fill(255, 0, 0);
    ellipse(i, counts_window[i][1], 5, 5, 1);
  }

  // Remove counts older than 5 seconds
  for(var i = counts_window.length-1; i >= 0 ; i--){
    if(n - counts_window[i][0] > 5000) {
      counts_window.splice(i, 1);
    }
  }

  // Every now and then we should pass this to the function that detects BPM
  movementsListener(counts_window);
}
