$(document).ready(function() {

  jQuery.extend({
    getQueryParameters : function(str) {
      return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
    }
  });

  var queryParams = $.getQueryParameters();

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
        this.transform( "t" + [ tdx, tdy ] + this.data('ot')  );
      }

      var dragEnd = function() {
      
      }
  });

  $.fn.addClassSVG = function(className){
      $(this).attr('class', function(index, existingClassNames) {
          return existingClassNames + ' ' + className;
      });
      return this;
  };

  $.fn.removeClassSVG = function(className){
      $(this).attr('class', function(index, existingClassNames) {
          var re = new RegExp(className, 'g');
          return existingClassNames.replace(re, '');
      });
      return this;
  };

  Element.prototype.hasClass = function(className) {
      return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
  };

  var mapSVG = Snap.select('#municipalities-map');
  var mapGroup = Snap.select('#map-container');
  mapGroup.altDrag();

  //mapScaleGroup.attr('transform', 'scale(2)' );

  //window.seeCords = function() {
  //  var bbox = mapGroup.getBBox();
  //  var cx = bbox.cx //+(bbox.width/2)
  //  var cy = bbox.cy //+(bbox.height/2);
  //}

  window.zoomInn = function() {
    var oldScale = mapGroup.attr('transform').local.match(/[0-9.]+/) || [1.0];
    scale = ((+oldScale[0])+0.2);
    console.log(parseFloat(scale), oldScale);
    window.scaleMap(parseFloat(scale));
  }

  window.zoomOut = function() {
    var oldScale = mapGroup.attr('transform').local.match(/[0-9.]+/) || [1.0];
    scale = ((+oldScale[0])-0.2);
    console.log(parseFloat(scale), oldScale);
    window.scaleMap(parseFloat(scale));
  }

  window.getInfo = function() {
    //alert(JSON.stringify(mapGroup.getBBox()) );
    var bbox = mapGroup.getBBox();
    console.log("bbox", mapGroup.getBBox() );
    console.log("center", (bbox.width/2) - bbox.x )
  }

  var selectMunicipality = function(muni, animation) {
    if(muni) {
      bbox = Snap.select('#'+muni).getBBox();
    }
    maxWidthScale = (4000.0/bbox.width);
    maxHeightScale = (4000.0/bbox.height);

    // Choose the lowes scale so that the whole piece fits 
    scale = maxWidthScale <= maxHeightScale ? maxWidthScale: maxHeightScale;
    scale = scale * 0.8

    maxSize = bbox.width >= bbox.height ? bbox.width : bbox.height;

    // Calculate the offset for the piece and add the half the remaining width/height of the view.
    // Can't find the remaining width of the view so using the size of the piece
    xoffset = (bbox.x + 676.0 - ((maxSize)/4));
    yoffset = (bbox.y + 79.5 - ((maxSize)/4));

    // do not accept offsets bellow 0
    scaledXOffset = xoffset > 0 ? xoffset * (scale*0.90) : 0;
    scaledYOffset = yoffset > 0 ? yoffset * (scale*0.90) : 0;

    $('.new-municipality').removeClassSVG('active')
    $('#'+muni).addClassSVG('active');

    mapGroup.animate({ transform: 'translate(-' + scaledXOffset + ',-' + scaledYOffset + ') scale('+ scale*0.90 +')'}, animation);
  }

  var backToMap = function(animation) {
    $('.new-municipality').removeClassSVG('active')
    mapGroup.animate({ transform: 'scale(1)'}, animation);
  }

  $('.new-municipality').dblclick(function(){
    $(this)
    if ($(this).hasClass('active')) {
      backToMap(300);
      return;
    };
    selectMunicipality($(this).attr('id'), 300);
  });

  $('.new-municipality').doubletap(function(){
    if ($(this).hasClass('active')) {
      backToMap(300);
      return;
    };
    selectMunicipality($(this).attr('id'), 300);
  });

  $('.svg-bg').dblclick(function() {
    backToMap(300);
  });

  $('#municipality-selector').select2({
    placeholder: "Velg kommune"
  });

  $('#municipality-selector').select2({
    placeholder: "Velg kommune"
  });

  $('#municipality-selector').on('change', function() {
    var selected = $(this).val();
    if (selected == 'backToMap') {
      backToMap(300);
    } else {
      selectMunicipality(selected, 300);
    };
  })

  // If linked directly with param m select the municipality with no animation
  if(queryParams.m) {
    animation_duration = parseInt(queryParams.d) || 0;
    selectMunicipality(queryParams.m, animation_duration);
  }


  window.scaleMap = function(scale) {
    var oldScale = mapGroup.attr('transform').local.match(/[0-9]+/) || 1;
    var position = mapGroup.attr('transform').local.match(/([^t,][0-9.]+)/g);


    if(position == undefined) {
      position = [0,0];
    }

    var horizontalPosition = parseFloat(position[0]) || 0.0;
    var verticalPosition = parseFloat(position[1]) || 0.0;

    var bbox = mapGroup.getBBox();

    var cx = (bbox.x + bbox.width)/2;
    var cy = (bbox.y + bbox.height)/2;   // finding center of element

    cx2 = cx //cx //- (parseFloat(position[0]) * scale);
    cy2 = cy //cy //- (parseFloat(position[1]) * scale);



    // Shift the image so that the middle is in the upper left corner taking into account the amout of scaling;
    //mapGroup.attr('transform', 'translate(-' +(cx2-(scale*cx2)) + ', -' + (cy2-(scale*cy2)) + ')');
    // scale the image
    mapGroup.attr('transform', 'scale('+ scale +')');
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
