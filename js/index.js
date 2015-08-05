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

  var selectMunicipality = function(muni, animation) {
    if(muni) {
      bbox = Snap.select('#'+muni).getBBox();
    }
    maxWidthScale = (4000.0/bbox.width);
    maxHeightScale = (4000.0/bbox.height);

    // Choose the lowes scale so that the whole piece fits 
    scale = maxWidthScale <= maxHeightScale ? maxWidthScale: maxHeightScale;
    scale = scale * 0.75

    maxSize = bbox.width >= bbox.height ? bbox.width : bbox.height;

    // viewbox offset
    offset = ((4000-4000/scale)/2);

    var viewSize = (4000/scale)

    $('#zoom').val(scale)

    $('.new-municipality').removeClassSVG('active')
    $('#'+muni).addClassSVG('active');

    mapGroup.animate({ transform: 'translate(' + (2000-bbox.cx) + ',' + (2000-bbox.cy) + ')'}, animation);
    Snap.animate(mapSVG.attr("viewBox").vb.split(" "), [ offset, offset, viewSize, viewSize ], function(values){ mapSVG.attr("viewBox", values.join(" ")); }, animation)
  }

  window.scaleMap = function(scale) {
    offset = ((4000-4000/scale)/2);
    viewSize = (4000 / scale);

    Snap.animate(mapSVG.attr("viewBox").vb.split(" "), [ offset, offset, viewSize, viewSize ], function(values){ mapSVG.attr("viewBox", values.join(" ")); }, 200)
    $('#zoom').val(scale)
  }

  window.zoomInn = function() {
    var viewBox = mapSVG.attr('viewBox');
    var oldScale = (4000/viewBox.width);
    scale = ((+oldScale)*1.3);
    if(scale >=20) {
      return;
    }
    scaleMap(scale);
    $('#zoom').val(scale)
  }

  window.zoomOut = function() {
    var viewBox = mapSVG.attr('viewBox');
    var oldScale = (4000/viewBox.width);
    scale = ((+oldScale)/1.3);
    if(scale <=0.9) {
      return;
    }
    scaleMap(scale);
    $('#zoom').val(scale)
  }

  var backToMap = function(animation) {
    $('#zoom').val(1)
    $('.new-municipality').removeClassSVG('active')
    mapGroup.animate({ transform: 'translate(0,0)'}, animation);
    Snap.animate(mapSVG.attr("viewBox").vb.split(" "), [ 0, 0, 4000, 4000 ], function(values){ mapSVG.attr("viewBox", values.join(" ")); }, animation)
  }

  $('#zoom').on('input', function() {
    window.scaleMap($(this).val());
  });

  $('#municipalities-map').bind('mousewheel', function(e) {
    if(e.originalEvent.wheelDelta / 120 > 0) {
      console.log(e.originalEvent.wheelDelta);
      window.zoomInn();
    } else {
      window.zoomOut();
    }
  });


  $('.new-municipality').dblclick(function(){
    $(this)
    if ($(this).hasClass('active')) {
      backToMap(300);
      return;
    };
    selectMunicipality($(this).attr('id'), 500);
  });

  $('.svg-bg').dblclick(function() {
    backToMap(500);
  });

  $('#municipality-selector').select2({
    placeholder: "Velg kommune",
    width: '100%',
    "language": {
       "noResults": function(){
           return "Ingen kommuner";
       }
    }
  });

  $('#municipality-selector').on('change', function() {
    var selected = $(this).val();
    if (selected == 'backToMap') {
      backToMap(500);
    } else {
      selectMunicipality(selected, 500);
    };
  })

  // If linked directly with param m select the municipality with no animation
  if(queryParams.m) {
    animation_duration = parseInt(queryParams.d) || 0;
    selectMunicipality(queryParams.m, animation_duration);
  }


});
