
$(document).ready(function() {


  Snap.plugin( function( Snap, Element, Paper, global ) {
        Element.prototype.altDrag = function() {
        this.drag( dragMove, dragStart, dragEnd );
        return this;
      }
         
      var dragStart = function ( x,y,ev ) {
        this.data('ot', this.transform().local );
      }
  
      var dragMove = function(dx, dy, ev, x, y) {
        var tdx, tdy;
        var snapInvMatrix = this.transform().diffMatrix.invert();
        snapInvMatrix.e = snapInvMatrix.f = 0; 
        tdx = snapInvMatrix.x( dx,dy ); tdy = snapInvMatrix.y( dx,dy );
        this.transform( this.data('ot') + "t" + [ tdx, tdy ]  );
      }

      var dragEnd = function() {
      
      }
  });




  var mapSVG = Snap.select('#municipalities-map');


  var mapGroup = Snap.select('#map-container');
  mapGroup.altDrag();


  var mapScaleGroup = Snap.select('#map-scaler');

  //mapScaleGroup.attr('transform', 'scale(2)' );

  //window.seeCords = function() {
  //  var bbox = mapGroup.getBBox();
  //  var cx = bbox.cx //+(bbox.width/2)
  //  var cy = bbox.cy //+(bbox.height/2);
  //}

  window.zoomInn = function() {
    var oldScale = mapScaleGroup.attr('transform').local.match(/[0-9.]+/) || [1.0];
    scale = ((+oldScale[0])+0.2);
    console.log(parseFloat(scale), oldScale);
    window.scaleMap(parseFloat(scale));
  }

  window.zoomOut = function() {
    var oldScale = mapScaleGroup.attr('transform').local.match(/[0-9.]+/) || [1.0];
    scale = ((+oldScale[0])-0.2);
    console.log(parseFloat(scale), oldScale);
    window.scaleMap(parseFloat(scale));
  }

  window.getInfo = function() {
    alert(JSON.stringify(mapGroup.getBBox()) );
  }

  window.scaleMap = function(scale) {
    var oldScale = mapScaleGroup.attr('transform').local.match(/[0-9]+/) || 1;
    var position = mapGroup.attr('transform').local.match(/([^t,][0-9.]+)/g);


    if(position == undefined) {
      position = [0,0];
    }

    var horizontalPosition = parseFloat(position[0]) || 0.0;
    var verticalPosition = parseFloat(position[1]) || 0.0;


    var bbox = mapGroup.getBBox();
    var cx = bbox.x + (bbox.width/2)
    var cy = bbox.y + (bbox.height/2);   // finding center of element




    cx2 = cx //- (parseFloat(position[0]) * scale);
    cy2 = cy //- (parseFloat(position[1]) * scale);


    mapGroup.transform().diffMatrix.invert();

    // Shift the image so that the middle is in the upper left corner taking into account the amout of scaling;
    mapGroup.attr('transform', 'translate(-' +(cx2-(scale*cx2)) + ', -' + (cy2-(scale*cy2)) + ')');
    // scale the image
    mapScaleGroup.attr('transform', 'scale('+ scale +')');
    // Shift the image back again
    mapGroup.attr('transform', 'translate(' + (cx2-(scale*cx2)) + ', ' + (cy2-(scale*cy2)) + ')');



    //mapGroup.attr('transform', 'matrix( 1, 0, 0, 1, ' + (cx2-(scale*cx2)) + ' ' + (cy2-(scale*cy2)) + ')')

    //console.log(scale, scale, scale/oldScale);

    //var scaleValue = (scale/oldScale);

    //if(position == undefined) {
    //  mapGroup.attr('transform', 'scale(' +  scale +') transform(-400 -400)');
    //}

    //var verticalPosition = position[0] || 0;
    //var horizontalPosition = position[1] || 0;

    //mapGroup.transform('t'+ (position[0] * scaleValue) + ',' + (position[1] * scaleValue) )
    //mapGroup.attr('transform', 'matrix(' + scale + ' 0 0 ' + scale + ' ' + verticalPosition + ' ' + horizontalPosition + ')');
    //console.log(position, mapGroup.attr('transform'));
    //mapScaleGroup.attr('transform', 'scale(' + scale + ')')
    //mapGroup.attr('transform', 'translate(' + (verticalPosition*3) + ' ' + (horizontalPosition*3) + ')');
  }





});
