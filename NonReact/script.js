/* 
*
*
Javascript for Collective Conscience Client 
By Abhi Nayar (https://linkedin.com/in/abhinayar) | March 2018
*
*
Designed in collaboration with the CCAM @ Yale (https://ccam.yale.edu/), Florrie Marshall (Yale School of Music)
*
*
All rights reserved, please contact author at abhishek[dot]nayar[at]yale[dot]edu for any additional
information, bug reports, etc.
*
*/

// Settimeout to allow canvas time to load
setTimeout(function() {
  // Helpers
  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; }
   } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
   
  // Get the color preview id
  colorPreview = document.getElementById("color-preview");
  overlay = document.getElementById("wheel-overlay");
  canvas = document.getElementById("color-wheel");
  
  // Dynamically set the width/height of canvas
  screenWidth = $(window).width(),
  screenHeight = $(window).height();
  if (screenWidth > screenHeight) screenWidth = 0.6 * screenHeight;
  else screenWidth = screenWidth - 60;
  
  canvas.width = screenWidth;
  canvas.height = canvas.width;
  $('#wheel-overlay').css('width', screenWidth + 3);
  $('#wheel-overlay').css('height', screenWidth + 3);
  
  // Autorun function on page load
  $(function () {
    // Get context
    ctx = canvas.getContext("2d");
  
    // Draw circle function (if it wasnt obvious)
    function drawCircle() {
      var radius = canvas.width / 2;
      var image = ctx.createImageData(2 * radius, 2 * radius);
      var data = image.data;

      for (var x = -radius; x < radius; x++) {
        for (var y = -radius; y < radius; y++) {
          var _xy2polar = xy2polar(x, y),
              _xy2polar2 = _slicedToArray(_xy2polar, 2),
              r = _xy2polar2[0],
              phi = _xy2polar2[1];

          if (r > radius) {
            // skip all (x,y) coordinates that are outside of the circle
            continue;
          }

          var deg = rad2deg(phi);

          // Figure out the starting index of this pixel in the image data array.
          var rowLength = 2 * radius;
          var adjustedX = x + radius; // convert x from [-50, 50] to [0, 100] (the coordinates of the image data array)
          var adjustedY = y + radius; // convert y from [-50, 50] to [0, 100] (the coordinates of the image data array)
          var pixelWidth = 4; // each pixel requires 4 slots in the data array
          var index = (adjustedX + adjustedY * rowLength) * pixelWidth;

          // This adjusts what values are being shown
          var hue = deg;
          var saturation = r / (radius / 1);
          var value = 1.0;

          var _hsv2rgb = hsv2rgb(hue, saturation, value),
              _hsv2rgb2 = _slicedToArray(_hsv2rgb, 3),
              red = _hsv2rgb2[0],
              green = _hsv2rgb2[1],
              blue = _hsv2rgb2[2];

          var alpha = 255;

          data[index] = red;
          data[index + 1] = green;
          data[index + 2] = blue;
          data[index + 3] = alpha;
        }

      }
      
      ctx.putImageData(image, 0, 0);
    }

    function xy2polar(x, y) {
      var r = Math.sqrt(x * x + y * y);
      var phi = Math.atan2(y, x);
      return [r, phi];
    }

    // rad in [-π, π] range
    // return degree in [0, 360] range
    function rad2deg(rad) {
      return (rad + Math.PI) / (2 * Math.PI) * 360;
    }

    drawCircle();
  })  
  
  // Select color on mousedown and send to preview
  function selectColor(e) {
    console.log('selecting color...' , e.pageX)
    // Get the x and y prop of click
    var x = e.pageX - canvas.offsetLeft,
        y = e.pageY - canvas.offsetTop,   
        // Use x and y prop to find the color
        pixel = canvas.getContext("2d").getImageData(x, y, 1, 1).data,
  	    pixelColor = "rgb(" + pixel[0] + ", " + pixel[1]+", "+ pixel[2]+ ")";
        
    // Set the preview background color
  	colorPreview.style.backgroundColor = pixelColor;
    
    // pixel color is our newly updated value
    // TODO: Send to firebase
  }

  // hue in range [0, 360]
  // saturation, value in range [0,1]
  // return [r,g,b] each in range [0,255]
  // See: https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
  function hsv2rgb(hue, saturation, value) {
   var chroma = value * saturation;
   var hue1 = hue / 60;
   var x = chroma * (1 - Math.abs(hue1 % 2 - 1));
   var r1 = void 0,
       g1 = void 0,
       b1 = void 0;
   if (hue1 >= 0 && hue1 <= 1) {
     r1 = chroma;
     g1 = x;
     b1 = 0;
   } else if (hue1 >= 1 && hue1 <= 2) {
     r1 = x;
     g1 = chroma;
     b1 = 0;
   } else if (hue1 >= 2 && hue1 <= 3) {
     r1 = 0;
     g1 = chroma;
     b1 = x;
   } else if (hue1 >= 3 && hue1 <= 4) {
     r1 = 0;
     g1 = x;
     b1 = chroma;
   } else if (hue1 >= 4 && hue1 <= 5) {
     r1 = x;
     g1 = 0;
     b1 = chroma;
   } else if (hue1 >= 5 && hue1 <= 6) {
     r1 = chroma;
     g1 = 0;
     b1 = x;
   }

   var m = value - chroma;
   var r = r1 + m,
       g = g1 + m,
       b = b1 + m;

   // Change r,g,b values from [0,1] to [0,255]

   return [255 * r, 255 * g, 255 * b];
  }
  
  $('#color-wheel, #wheel-overlay').bind('click', function(e) {
    selectColor(e);
    e.preventDefault();
  }); 
}, 500);

// Prevent scrolling
function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
} disableScroll();
function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

