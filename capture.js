// p5.js movement detection and camera capture
//
// SETTINGS
// Threshold (80-255):
var threshold = 150;

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

function mousePressed()
{
  var h2 = $("#dance2 h2")
  h2.fadeOut('slow', function() {
    h2.text('Please move away from the screen for one second');
    h2.fadeIn('slow', function() {
      setTimeout(catchBackground, 5000);
    });
  });
}

function catchBackground()
{
  background_pixels = []
  // When pixels are defined load background
  if (background_pixels.length == 0 && capture.pixels[0] > 0) {
    var d = pixelDensity();
    var max_i = 4 * (width * d) * (height * d);
    for (var i = 0; i < max_i; i++) {
      background_pixels.push(capture.pixels[i]);
    }
  }
  console.log('Reset background')
  var h2 = $("#dance2 h2")
  h2.fadeOut('fast', function() {
    h2.text('Start dancing now');
    h2.fadeIn('slow', function() {
      h2.fadeOut('slow', function() {
      });
    });
  });
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


  // Loop through all the pixels
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var i = y * width*4 + x *4;

      //var r = abs(pixels[i] - background_pixels[i]);
      //var g = abs(pixels[i+1] - background_pixels[i + 1]);
      //var b = abs(pixels[i+2] - background_pixels[i + 2]);
      var r = Math.abs(capture.pixels[i] - background_pixels[i]);
      var g = Math.abs(capture.pixels[i+1] - background_pixels[i + 1]);
      var b = Math.abs(capture.pixels[i+2] - background_pixels[i + 2]);

      //var d=sqrt(r^2+g^2+b^2)
      //var p=d/sqrt((255)^2+(255)^2+(255)^2)

      //console.log(r, g, b);
      //pixels[0] = 0;

      // Count the dark pixels for each column
      if ((r+g+b > threshold))
        counts[x]++;
      // if ((r-r_avgs > threshold && g-g_avgs > threshold & b-b_avgs > threshold))
    }
  }

  // Moving average
  average_counts = [];
  for (var x = 0; x < width; x++) {
    // HAHA, it's a hackaton, no rules!
    average_counts[x] = 0;
    for(var w = -20; w < 20; w++) {
      if (x+w >= 0 && x+w < width)
        average_counts[x] += counts[x+w];
    }
    average_counts[x] /= 41;
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
  if (counts_window.length > 1) {
    max_x = (max_x + counts_window[counts_window.length - 1][1])/2
  }
  if (max_x > 0) {
    counts_window.push([n, max_x]);
  }

  // Plot movements
  var movements = blurMovements(7, counts_window);
  movements = discretizeMovements(15, movements);
  var movValues = movements.map(function(val) {return val[1]});
  var min = Math.min.apply(null, movValues);
  var max = Math.max.apply(null, movValues);
  var normalizedMov = normalize(movValues, max, min);

  for(var i = 0; i < normalizedMov.length; i++) {
    fill(255, 0, 0);
    ellipse(i, height - height*0.25 - normalizedMov[i]*height/2, 5, 5, 1);
  }

  // Remove counts older than 5 seconds
  for(var i = counts_window.length-1; i >= 0 ; i--){
    if(n - counts_window[i][0] > slidingWindowSizeTime) {
      counts_window.splice(i, 1);
    }
  }


  // Display maximums
  plotMaximums(max, min, counts_window);

  // Every now and then we should pass this to the function that detects BPM
  movementsListener(counts_window);
}

function plotMaximums(max, min, counts_window) {
  // Display maximums
  var countsTemp = [];
  for(var i = 0; i < counts_window.length; i++) {
    countsTemp.push([i, counts_window[i][1]]);
  }
  var beats = calculateBeats(countsTemp);
  if(!beats) return;
  var normalizedBeats = normalize(beats.max.map(function(val) {return val[1]}), max, min);
  for(var i = 0; i < beats.max.length; i++) {
    fill(0, 255, 0);
    ellipse(beats.max[i][0], height - height*0.25 - height*normalizedBeats[i]/2, 10, 10, 1);
  }

}

function normalize(vals, max, min) {
  var _min = min || Math.min.apply(null, vals);
  var _max = max || Math.max.apply(null, vals);

  return vals.map(function(val){
    return (val-_min)/(_max-_min)
  });

}
