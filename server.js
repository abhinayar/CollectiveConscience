$(document).ready(function() {
  lastColor = "";


  db.ref('/users').on('child_changed', function(snap) {
    updateBackgroundColor();
  })

  // setInterval(function() {
  //   updateBackgroundColor();
  // }, 1000)

  function updateBackgroundColor() {
    rTotal = -1;
    gTotal = -1;
    bTotal = -1;

    db.ref('/users').once('value')
    .then(function(snap) {
      if (snap.val()) {
        var totalUsers = 0;

        snap.forEach(function(childSnap) {
          var user = childSnap.val();
          if (user) {
            if (user.connected) {
              totalUsers++;
              rTotal+= user.current_color_r,
              gTotal+= user.current_color_g,
              bTotal+= user.current_color_b;
            }
          } else {
            console.log('User not found');
          }
        })

        // Get final values
        if (rTotal !== -1 && gTotal !== -1 && bTotal !== -1) {
          var rFinal = rTotal / totalUsers,
          gFinal = gTotal / totalUsers,
          bFinal = bTotal / totalUsers;
          var rgbString = "rgb(" + rFinal + ", " + gFinal + ", " + bFinal + ")";
          console.log(rgbString);

          // Update the background color
          $('body').css('background-color', rgbString);

          // Update the master
          if (rgbString !== lastColor) {
            lastColor = rgbString;
            db.ref('final_colors').push({
              color : rgbString,
              timestamp : new Date().getTime()
            });
          }
        }
      }
    });
  } updateBackgroundColor()
});
