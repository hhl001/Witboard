$(document).ready(function(){
  var currBoardId = getCurrBoardId(); // TODO do something with this!
  var socket;
  if (currBoardId) {
    socket = io('/' + currBoardId);
  } else {
    socket = io.connect(window.location.hostname);
  }
  var typed = false;
  var timeout = undefined;
  var date = new Date();
  var passcode = date.getTime();
  var counter = 0;
  var data_point = {};
  var gClientId = -1;

  context = document.getElementById('canvas').getContext("2d");

  var points = {};
  // var clickX = new Array();
  // var clickY = new Array();
  // var clickDrag = new Array();
  var paint;

  socket.emit("initialize", gClientId);

  // returns the current board id if it exists, returns null otherwise
  function getCurrBoardId() {
    var re = new RegExp("/([0-9]+)$");
    var regexMatches = re.exec(window.location.href);
    if (!regexMatches || !(regexMatches[1])) {
      return null; 
    }
    return regexMatches[1];
  }

  function addClick(clientId, x, y, dragging)
  {
    if(!points.hasOwnProperty(clientId)){
      points[clientId] = {};
      points[clientId].clickX = new Array();
      points[clientId].clickY = new Array();
      points[clientId].clickDrag = new Array();
    }
    points[clientId].clickX.push(x);
    points[clientId].clickY.push(y);
    points[clientId].clickDrag.push(dragging);
  }

  var counter = 0;
  var data_point = {};

  $('#newBoardButton').click(function(e) {
    // TODO redirect to new board.
    socket.emit('new board');
  });

  $('#canvas').mousedown(function(e){
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
      
    paint = true;
    addClick(gClientId, mouseX, mouseY, false);
    redraw();
    data_point.location_x = mouseX;
    data_point.location_y = mouseY;
    data_point.clientId = gClientId;
    data_point.starting = true;

    counter += 1;
    socket.emit("draw point", data_point, counter);
  });

  $('#canvas').mousemove(function(e){
    if(paint){
      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;
      addClick(gClientId, mouseX, mouseY, true);
      redraw();
      data_point.location_x = mouseX;
      data_point.location_y = mouseY;
      data_point.clientId = gClientId;
      data_point.starting = false;

      counter += 1;
      socket.emit("draw point", data_point, counter);
    }
  });

  $('#canvas').mouseup(function(e){
    paint = false;
  });

  $('#canvas').mouseleave(function(e){
    paint = false;
  });

  function redraw(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    
    // todo: change styling
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 5;
    
    $.each(points, function(clientId, thisPoint) {
      for(var i=0; i < thisPoint.clickX.length; i++) {
        context.beginPath();
        if(thisPoint.clickDrag[i] && i){
          context.moveTo(thisPoint.clickX[i-1], thisPoint.clickY[i-1]);
         }else{
           context.moveTo(thisPoint.clickX[i]-1, thisPoint.clickY[i]);
         }
         context.lineTo(thisPoint.clickX[i], thisPoint.clickY[i]);
         context.closePath();
         context.stroke();
      }
    });
  }

  socket.on("draw point", function(data_point, counter){
    var mouseX = data_point.location_x;
    var mouseY = data_point.location_y;
    var otherClientId = data_point.clientId;

    if(data_point.starting){
      addClick(otherClientId, mouseX, mouseY, false);
    }
    else{
      addClick(otherClientId, mouseX, mouseY, true);
    }
    redraw();
  });

  socket.on("initialize", function(clientId){
    gClientId = clientId;
  });


  socket.on('board created', function(newBoardId) {
    // socket = io(window.location.hostname + newBoardId);
    // debugger;
    window.location.href += newBoardId;
  });

}); // document.ready
