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

// First initialize the color picker
// setTimeout to give Canvas time to initialize 
setTimeout(function() {
  // Get the color wheel
  colorPicker = document.getElementById("color-wheel");
  console.log(colorPicker);
  
  screenWidth = $(window).width(),
  screenHeight = $(window).height();
  if (screenWidth > screenHeight) screenWidth = 0.6 * screenHeight;
  else screenWidth = screenWidth - 50;
  
  colorPicker.width = screenWidth;
  colorPicker.height = colorPicker.width;
  // Set the on mouse down property to trigger click function
  colorPicker.onmousedown = selectColor;
  // Get the color preview id
  colorPreview = document.getElementById("color-preview");
  console.log(colorPreview)
  // Add to DOM
  addColorPicker();
}, 1)

$(window).on('resize', function() {
  screenWidth = $(window).width(),
  screenHeight = $(window).height();
  
  console.log(screenWidth, screenHeight)
  
  if (screenWidth > screenHeight) screenWidth = 0.6 * screenHeight;
  else screenWidth = screenWidth - 50;
  
  newColorPicker = colorPicker.getContext("2d");
  newColorPicker.clearRect(0, 0, colorPicker.width, colorPicker.height);
  $('#color-wheel').attr('width', screenWidth).attr('height', screenWidth);;
  addColorPicker();
})

// Adds color picker to DOM
function addColorPicker() {
  // Get the canvas context
	newColorPicker = colorPicker.getContext("2d"),
  // Find the center
  center_x = (colorPicker.width)/2,
  center_y = (colorPicker.height)/2,
  sx = center_x,
  sy = center_y;
  // Generate the palette
	palette = new colorPickerElement(center_x, center_y, sx, sy);
  // Draw the canvas
	palette.draw();
}

// Select color on mouse down
function selectColor(e) {
  // Get the x and y prop of click
  var x = e.pageX - colorPicker.offsetLeft,
      y = e.pageY - colorPicker.offsetTop,   
      // Use x and y prop to find the color
      pixel = colorPicker.getContext("2d").getImageData(x, y, 1, 1).data,
	    pixelColor = "rgb(" + pixel[0] + ", " + pixel[1]+", "+ pixel[2]+ ")";
      
  // Set the preview background color
	colorPreview.style.backgroundColor = pixelColor;
  
  // pixel color is our newly updated value
  // TODO: Send to firebase
}

// Define color picker element / wheel
function colorPickerElement(center_x, center_y, sx, sy) {
  // Find center
	this.center_x = center_x;
	this.center_y = center_y;
	this.sx = sx;
	this.sy = sy;
  // Draw function
	this.draw = function() {
    // Loop through circle w/ 0.1 increments
		for(var i = 0; i < 360; i+=0.005) {
      // Find radian
			var rad = (i) * (Math.PI) / 180;
      // Set the stroke style HSLA value
			newColorPicker.strokeStyle = "hsla(" + i  + ", " + 100 + "%, 50%, " + 1 + ")";
      // TODO: Smoothing
      // Draw the stroke
			newColorPicker.beginPath();
			newColorPicker.moveTo(center_x, center_y);
			newColorPicker.lineTo(center_x + sx * Math.cos(-rad), center_y + sy * Math.sin(rad));
			newColorPicker.stroke();	
		}
	}
}

function easeInOut(t) {return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1}