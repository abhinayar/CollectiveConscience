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

          var color1 = rgbString;
          var color2 = shadeBlendConvert(0.2, color1);
          var color3 = shadeBlendConvert(0.4, color1);
          var color4 = shadeBlendConvert(0.8, color1);
          var bodyBg = shadeBlendConvert(-0.85, color1);

          $('#visualizer #stop1').attr('style', 'stop-color:' + color4 + ';stop-opacity:1')
          $('#visualizer #stop2').attr('style', 'stop-color:' + color3 + ';stop-opacity:1')
          $('#visualizer #stop3').attr('style', 'stop-color:' + color2 + ';stop-opacity:1')
          $('#visualizer #stop4').attr('style', 'stop-color:' + color1 + ';stop-opacity:1')

          $('body').css('background-color', bodyBg);

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

window.onload = function () {
    "use strict";
    var paths = document.getElementsByTagName('path');
    var visualizer = document.getElementById('visualizer');
    var mask = visualizer.getElementById('mask');
    var path;
    var report = 0;

    var soundAllowed = function (stream) {
        //Audio stops listening in FF without // window.persistAudioStream = stream;
        //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
        //https://support.mozilla.org/en-US/questions/984179
        window.persistAudioStream = stream;
        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        visualizer.setAttribute('viewBox', '0 0 255 255');

				//Through the frequencyArray has a length longer than 255, there seems to be no
        //significant data after this point. Not worth visualizing.
        for (var i = 0 ; i < 255; i++) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-dasharray', '4,1');
            mask.appendChild(path);
        }
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
          	var adjustedLength;
            for (var i = 0 ; i < 255; i++) {
              	adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + adjustedLength);
            }

        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        h.innerHTML = "You must allow your microphone.";
        console.log(error);
    }

    /*window.navigator = window.navigator || {};
    /*navigator.getUserMedia =  navigator.getUserMedia       ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia    ||
                              null;*/
    navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);

};

var shadeBlendConvert = function (p, from, to) {
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(to&&typeof(to)!="string"))return null; //ErrorCheck
    if(!this.sbcRip)this.sbcRip=(d)=>{
        let l=d.length,RGB={};
        if(l>9){
            d=d.split(",");
            if(d.length<3||d.length>4)return null;//ErrorCheck
            RGB[0]=i(d[0].split("(")[1]),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
        }else{
            if(l==8||l==6||l<4)return null; //ErrorCheck
            if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 or 4 digit
            d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=-1;
            if(l==9||l==5)RGB[3]=r((RGB[2]/255)*10000)/10000,RGB[2]=RGB[1],RGB[1]=RGB[0],RGB[0]=d>>24&255;
        }
    return RGB;}
    var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=this.sbcRip(from),t=this.sbcRip(to);
    if(!f||!t)return null; //ErrorCheck
    if(h)return "rgb"+(f[3]>-1||t[3]>-1?"a(":"(")+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
    else return "#"+(0x100000000+r((t[0]-f[0])*p+f[0])*0x1000000+r((t[1]-f[1])*p+f[1])*0x10000+r((t[2]-f[2])*p+f[2])*0x100+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)).toString(16).slice(1,f[3]>-1||t[3]>-1?undefined:-2);
}
