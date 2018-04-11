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

// Global User Object
user = {
  email : null,
  id : "",
  name : null,
  connected : false,
  colors : ""
}
// Global Activity Object
lastActivity = null;

// Once DOM is ready
$(document).on('ready', function() {
  // First thing we want to do is check for the email submission
  // But before we do this, let's check if the user is already in localStorage,
  // and if so pull them from there

  // Step 1: Check if localStorage exists
  // EX: DNE in Private Safari
  function html5_storage_support() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}

  var storedUser = null;
  if (html5_storage_support()) {
    // If we DO have localStorage... then we'll go straight to the wheel
    //localStorage.clear();
    storedUser = localStorage.getItem('user');
  }

  if (storedUser) {
    storedUser = JSON.parse(storedUser);

    user.email = storedUser.email,
    user.id = storedUser.id,
    user.name = storedUser.name,
    user.connected = false,
    user.colors = "";

    // Redirect to the app screen
    $('#email_screen').css('z-index', 8);
    $('#app_screen').css('z-index', 10);

    // Run the color wheel function
    showColorWheel();

    // Setup unload function
    $(window).on("unload", function() {
      if (user.id !== "" && typeof(user.id) != undefined) {
        db.ref('/users/' + user.id + '/connected').set(false);
      }
    })
  } else {
    // If we DO NOT have localStorage, then we prompt for it
    // Check for email submission
    $('.submit_btn button').on('click', function() {
      console.log('Clicked Submit Button');

      var name = $('#full_name').val(),
      email = $('#email').val();

      console.log(name, email);

      if (!name || name.length == 0) {
        alert('You must enter a name!')
      } else if (!email || email.length == 0 || !validateEmail(email)) {
        alert('Please enter a valid email!');
      } else {
        // Set the user attributes
        user.connected = false,
        user.email = email,
        user.id = db.ref('/users').push().getKey(),
        user.name = name;

        // Set item to Local Storage
        localStorage.setItem('user', JSON.stringify(user));

        // Setup unload function
        $(window).on("unload", function() {
          if (user.id !== "" && typeof(user.id) != undefined) {
            db.ref('/users/' + user.id + '/connected').set(false);
          }
        })

        // Send user to firebase
        db.ref('/users/' + user.id).set(user);

        // Switch to app screen
        $('#email_screen').css('z-index', 8);
        $('#app_screen').css('z-index', 10);

        // Run the color wheel function
        showColorWheel();
      }
    });
  }

  // Show Color Wheel function
  // Creates the canvas that displays the color wheel
  // Also creates an instance of the color picking function
  function showColorWheel() {
    // Get the color items from DOM
    colorPreview = document.getElementById("color-preview");
    overlay = document.getElementById("wheel-overlay");
    canvas = document.getElementById("color-wheel");

    // Dynamically set the width/height of canvas
    // First calc. the height needed
    screenWidth = $(window).width(),
    screenHeight = $(window).height();
    if (screenWidth > screenHeight) screenWidth = 0.6 * screenHeight;
    else screenWidth = screenWidth - 50;

    // Set the width and height of canvas
    canvas.width = screenWidth;
    canvas.height = canvas.width;
    // Set the wheel overlay height
    $('#wheel-overlay').css('width', screenWidth + 6);
    $('#wheel-overlay').css('height', screenWidth + 6);

    // Autorun function
    // Sets up the canvas element
    $(function () {
      // Get the context
      ctx = canvas.getContext("2d");

      // Draw circle function (if it wasnt obvious)
      drawCircle(canvas, ctx);

      // Check for inactivity and prune user's connected status
      setInterval(function() {
        if (user.id !== "") {
          var curTime = new Date().getTime(),
          dif = curTime - lastActivity;
          console.log('dif', dif);
          checkDifAndChange(dif)
        }
      }, 60000)
    })

    // Bind the click function on
    $('#color-wheel, #wheel-overlay').bind('click', function(e) {
      selectColor(e);
      e.preventDefault();
    });

    $('.explanation_icon').bind('click', function() {
      $('#explanation_screen').css('z-index', '11');
      $('#app_screen #content').hide();
      enableScroll();
    });
    $('.close_icon').bind('click', function() {
      console.log('clicked c')
      $('#explanation_screen').css('z-index', '8');
      $('#app_screen #content').show();
      disableScroll();
    });

    // Scroll to top and disable Scrolling For UX
    window.scrollTo(0,1);
    disableScroll();
  }
})

//////////
// Helpers
//////////

// Checks for email validity
// NOTE: This is not foolproof and rejects some valid emails,
// not the end of the world for this purpose.
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Sliced to array helper
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; }
 } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Draw circle helper
function drawCircle(canvas, ctx) {
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

// Set user status to inactive
function checkDifAndChange(dif) {
  if (dif > 2 * 60000) {
    db.ref('/users/' + user.id + '/connected').set(false, function(err) {
      if (err) alert('An error occured. Please refresh');
    })
  }
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

  // Update user in firebase
  lastActivity = new Date().getTime();
  db.ref('/users/' + user.id).update({
    'connected' : true,
    'current_color_r' : pixel[0],
    'current_color_g' : pixel[1],
    'current_color_b' : pixel[2],
  }, function(err) {
    if (err) alert('An error occured, please refresh!');
  });
  db.ref('/users/' + user.id + '/colors').push({
    color : pixelColor,
    time : lastActivity
  });
}

// Prevent scrolling
function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
}
function enableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', null, false);
  window.onwheel = null; // modern standard
  window.onmousewheel = document.onmousewheel = null; // older browsers, IE
  window.ontouchmove  = null; // mobile
}
function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}
