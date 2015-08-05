$(document).ready(function() {

  jQuery.extend({
    getQueryParameters : function(str) {
      return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
    }
  });

  var queryParams = $.getQueryParameters();

  var noClicking = false;

  Snap.plugin( function( Snap, Element, Paper, global ) {
        Element.prototype.altDrag = function() {
        this.drag( dragMove, dragStart, dragEnd );
        return this;
      }
         
      var dragStart = function ( x,y,ev ) {
        noClicking = true;
        if( (typeof x == 'object') && ( x.type == 'touchstart') ) {
            x.preventDefault();
            this.data('ox', x.changedTouches[0].clientX );
            this.data('oy', x.changedTouches[0].clientY );  
        }
        this.data('ot', this.transform().local );
        return false;
      }
  
      var dragMove = function(dx, dy, ev, x, y) {
        var tdx, tdy;
        var snapInvMatrix = this.transform().diffMatrix.invert();
        snapInvMatrix.e = snapInvMatrix.f = 0; 
        tdx = snapInvMatrix.x( dx,dy ); 
        tdy = snapInvMatrix.y( dx,dy );
        this.transform( "t" + [ tdx, tdy ] + this.data('ot')  );
      }

      var dragEnd = function(eve) {
        
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




  var dragMoveListener = function(event) {
    console.log("test");
  }

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
    if (noClicking) {
      noClicking = false;
      return;
    };
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

  var updateZipLink = function(target) {

    $('#download-zip').attr('href', 'zip/')
  }

  $('.new-municipality').click(function(){
    if (noClicking) {
      noClicking = false;
      return;
    };
    if ($(this).hasClass('active')) {
      backToMap(300);
      return;
    };
    selectMunicipality($(this).attr('id'), 500);
  });

  $('.new-municipality').on( "tap", function( event ) { 
    if ($(this).hasClass('active')) {
      backToMap(300);
      return;
    };
    selectMunicipality($(this).attr('id'), 500);
   });

  $('.svg-bg').click(function() {
    backToMap(500);
  });

  $('.svg-bg').on( "tap", function( event ) { 
    backToMap(500);
  });

  var data = [{ id: 'new-Halden', text: 'Halden' },{ id: 'new-Halden', text: 'Aremark' },{ id: 'new-Nedre-Glomma', text: 'Sarpsborg' },{ id: 'new-Nedre-Glomma', text: 'Fredrikstad' },{ id: 'new-Nedre-Glomma', text: 'Hvaler' },{ id: 'new-Nedre-Glomma', text: 'Rakkestad' },{ id: 'new-Indre-Ostfold', text: 'Marker' },{ id: 'new-Indre-Ostfold', text: 'Rømskog' },{ id: 'new-Indre-Ostfold', text: 'Trøgstad' },{ id: 'new-Indre-Ostfold', text: 'Spydeberg' },{ id: 'new-Indre-Ostfold', text: 'Askim' },{ id: 'new-Indre-Ostfold', text: 'Eidsberg' },{ id: 'new-Indre-Ostfold', text: 'Skiptvet' },{ id: 'new-Indre-Ostfold', text: 'Hobøl' },{ id: 'new-Moss', text: 'Moss' },{ id: 'new-Moss', text: 'Råde' },{ id: 'new-Moss', text: 'Rygge' },{ id: 'new-Moss', text: 'Våler (Østf.)' },{ id: 'new-Follo', text: 'Vestby' },{ id: 'new-Follo', text: 'Ski' },{ id: 'new-Follo', text: 'Ås' },{ id: 'new-Follo', text: 'Frogn' },{ id: 'new-Follo', text: 'Nesodden' },{ id: 'new-Follo', text: 'Oppegård' },{ id: 'new-Follo', text: 'Enebakk' },{ id: 'new-Akershus-vest', text: 'Bærum' },{ id: 'new-Akershus-vest', text: 'Asker' },{ id: 'new-Nedre-Romerike', text: 'Aurskog-Høland' },{ id: 'new-Nedre-Romerike', text: 'Sørum' },{ id: 'new-Nedre-Romerike', text: 'Fet' },{ id: 'new-Nedre-Romerike', text: 'Rælingen' },{ id: 'new-Nedre-Romerike', text: 'Lørenskog' },{ id: 'new-Nedre-Romerike', text: 'Skedsmo' },{ id: 'new-Nedre-Romerike', text: 'Nittedal' },{ id: 'new-Ovre-Romerike', text: 'Gjerdrum' },{ id: 'new-Ovre-Romerike', text: 'Ullensaker' },{ id: 'new-Ovre-Romerike', text: 'Nes (Ak.)' },{ id: 'new-Ovre-Romerike', text: 'Eidsvoll' },{ id: 'new-Ovre-Romerike', text: 'Nannestad' },{ id: 'new-Ovre-Romerike', text: 'Hurdal' },{ id: 'new-Oslo', text: 'Oslo kommune' },{ id: 'new-Hamar', text: 'Hamar' },{ id: 'new-Hamar', text: 'Ringsaker' },{ id: 'new-Hamar', text: 'Løten' },{ id: 'new-Hamar', text: 'Stange' },{ id: 'new-Kongsvinger', text: 'Kongsvinger' },{ id: 'new-Kongsvinger', text: 'Nord-Odal' },{ id: 'new-Kongsvinger', text: 'Sør-Odal' },{ id: 'new-Kongsvinger', text: 'Eidskog' },{ id: 'new-Kongsvinger', text: 'Grue' },{ id: 'new-Kongsvinger', text: 'Åsnes' },{ id: 'new-Kongsvinger', text: 'Våler (Hedm.)' },{ id: 'new-Elverum', text: 'Elverum' },{ id: 'new-Elverum', text: 'Trysil' },{ id: 'new-Elverum', text: 'Åmot' },{ id: 'new-Elverum', text: 'Stor-Elvdal' },{ id: 'new-Elverum', text: 'Engerdal' },{ id: 'new-Tynset', text: 'Rendalen' },{ id: 'new-Tynset', text: 'Tolga' },{ id: 'new-Tynset', text: 'Tynset' },{ id: 'new-Tynset', text: 'Alvdal' },{ id: 'new-Tynset', text: 'Folldal' },{ id: 'new-Gjovik', text: 'Gjøvik' },{ id: 'new-Gjovik', text: 'Østre Toten' },{ id: 'new-Gjovik', text: 'Vestre Toten' },{ id: 'new-Gjovik', text: 'Søndre Land' },{ id: 'new-Gjovik', text: 'Nordre Land' },{ id: 'new-Lillehammer', text: 'Lillehammer' },{ id: 'new-Lillehammer', text: 'Sør-Fron' },{ id: 'new-Lillehammer', text: 'Ringebu' },{ id: 'new-Lillehammer', text: 'Øyer' },{ id: 'new-Lillehammer', text: 'Gausdal' },{ id: 'new-Hadeland', text: 'Lunner' },{ id: 'new-Hadeland', text: 'Gran' },{ id: 'new-Gudbrandsdalen', text: 'Dovre' },{ id: 'new-Gudbrandsdalen', text: 'Lesja' },{ id: 'new-Gudbrandsdalen', text: 'Skjåk' },{ id: 'new-Gudbrandsdalen', text: 'Lom' },{ id: 'new-Gudbrandsdalen', text: 'Vågå' },{ id: 'new-Gudbrandsdalen', text: 'Nord-Fron' },{ id: 'new-Gudbrandsdalen', text: 'Sel' },{ id: 'new-Valdres', text: 'Sør-Aurdal' },{ id: 'new-Valdres', text: 'Etnedal' },{ id: 'new-Valdres', text: 'Nord-Aurdal' },{ id: 'new-Valdres', text: 'Vestre Slidre' },{ id: 'new-Valdres', text: 'Øystre Slidre' },{ id: 'new-Valdres', text: 'Vang' },{ id: 'new-Drammen', text: 'Drammen' },{ id: 'new-Drammen', text: 'Øvre Eiker' },{ id: 'new-Drammen', text: 'Nedre Eiker' },{ id: 'new-Drammen', text: 'Lier' },{ id: 'new-Drammen', text: 'Røyken' },{ id: 'new-Drammen', text: 'Hurum' },{ id: 'new-Drammen', text: 'Svelvik' },{ id: 'new-Drammen', text: 'Sande (Vestf.)' },{ id: 'new-Ringerike', text: 'Jevnaker' },{ id: 'new-Ringerike', text: 'Ringerike' },{ id: 'new-Ringerike', text: 'Hole' },{ id: 'new-Kongsberg', text: 'Kongsberg' },{ id: 'new-Kongsberg', text: 'Flesberg' },{ id: 'new-Kongsberg', text: 'Rollag' },{ id: 'new-Kongsberg', text: 'Nore og Uvdal' },{ id: 'new-Hallingdal', text: 'Flå' },{ id: 'new-Hallingdal', text: 'Nes (Busk.)' },{ id: 'new-Hallingdal', text: 'Gol' },{ id: 'new-Hallingdal', text: 'Hemsedal' },{ id: 'new-Hallingdal', text: 'Ål' },{ id: 'new-Hallingdal', text: 'Hol' },{ id: 'new-Midtfylke', text: 'Sigdal' },{ id: 'new-Midtfylke', text: 'Krødsherad' },{ id: 'new-Midtfylke', text: 'Modum' },{ id: 'new-Horten-Holmestrand', text: 'Horten' },{ id: 'new-Horten-Holmestrand', text: 'Holmestrand' },{ id: 'new-Horten-Holmestrand', text: 'Hof' },{ id: 'new-Horten-Holmestrand', text: 'Re' },{ id: 'new-Tonsberg', text: 'Tønsberg' },{ id: 'new-Tonsberg', text: 'Nøtterøy' },{ id: 'new-Tonsberg', text: 'Tjøme' },{ id: 'new-Sandefjord', text: 'Sandefjord' },{ id: 'new-Sandefjord', text: 'Andebu' },{ id: 'new-Sandefjord', text: 'Stokke' },{ id: 'new-Larvik', text: 'Larvik' },{ id: 'new-Larvik', text: 'Lardal' },{ id: 'new-Grenland', text: 'Porsgrunn' },{ id: 'new-Grenland', text: 'Skien' },{ id: 'new-Grenland', text: 'Siljan' },{ id: 'new-Grenland', text: 'Bamble' },{ id: 'new-Grenland', text: 'Kragerø' },{ id: 'new-Grenland', text: 'Drangedal' },{ id: 'new-Midt-Telemark', text: 'Notodden' },{ id: 'new-Midt-Telemark', text: 'Nome' },{ id: 'new-Midt-Telemark', text: 'Bø (Telem.)' },{ id: 'new-Midt-Telemark', text: 'Sauherad' },{ id: 'new-Midt-Telemark', text: 'Tinn' },{ id: 'new-Midt-Telemark', text: 'Hjartdal' },{ id: 'new-Vest-Telemark', text: 'Seljord' },{ id: 'new-Vest-Telemark', text: 'Kviteseid' },{ id: 'new-Vest-Telemark', text: 'Nissedal' },{ id: 'new-Vest-Telemark', text: 'Fyresdal' },{ id: 'new-Vest-Telemark', text: 'Tokke' },{ id: 'new-Vest-Telemark', text: 'Vinje' },{ id: 'new-Ostre-Agder', text: 'Risør' },{ id: 'new-Ostre-Agder', text: 'Grimstad' },{ id: 'new-Ostre-Agder', text: 'Arendal' },{ id: 'new-Ostre-Agder', text: 'Gjerstad' },{ id: 'new-Ostre-Agder', text: 'Vegårshei' },{ id: 'new-Ostre-Agder', text: 'Tvedestrand' },{ id: 'new-Ostre-Agder', text: 'Froland' },{ id: 'new-Ostre-Agder', text: 'Åmli' },{ id: 'new-Kristiansand', text: 'Lillesand' },{ id: 'new-Kristiansand', text: 'Birkenes' },{ id: 'new-Kristiansand', text: 'Iveland' },{ id: 'new-Kristiansand', text: 'Kristiansand' },{ id: 'new-Kristiansand', text: 'Vennesla' },{ id: 'new-Kristiansand', text: 'Songdalen' },{ id: 'new-Kristiansand', text: 'Søgne' },{ id: 'new-Setesdal', text: 'Evje og Hornnes' },{ id: 'new-Setesdal', text: 'Bygland' },{ id: 'new-Setesdal', text: 'Valle' },{ id: 'new-Setesdal', text: 'Bykle' },{ id: 'new-Lindesnes-regionen', text: 'Mandal' },{ id: 'new-Lindesnes-regionen', text: 'Marnardal' },{ id: 'new-Lindesnes-regionen', text: 'Åseral' },{ id: 'new-Lindesnes-regionen', text: 'Audnedal' },{ id: 'new-Lindesnes-regionen', text: 'Lindesnes' },{ id: 'new-Lister-regionen', text: 'Farsund' },{ id: 'new-Lister-regionen', text: 'Flekkefjord' },{ id: 'new-Lister-regionen', text: 'Lyngdal' },{ id: 'new-Lister-regionen', text: 'Hægebostad' },{ id: 'new-Lister-regionen', text: 'Kvinesdal' },{ id: 'new-Lister-regionen', text: 'Sirdal' },{ id: 'new-Dalane', text: 'Eigersund' },{ id: 'new-Dalane', text: 'Sokndal' },{ id: 'new-Dalane', text: 'Lund' },{ id: 'new-Dalane', text: 'Bjerkreim' },{ id: 'new-Nord-Jaeren', text: 'Sandnes' },{ id: 'new-Nord-Jaeren', text: 'Stavanger' },{ id: 'new-Nord-Jaeren', text: 'Gjesdal' },{ id: 'new-Nord-Jaeren', text: 'Sola' },{ id: 'new-Nord-Jaeren', text: 'Randaberg' },{ id: 'new-Nord-Jaeren', text: 'Finnøy' },{ id: 'new-Nord-Jaeren', text: 'Rennesøy' },{ id: 'new-Nord-Jaeren', text: 'Kvitsøy' },{ id: 'new-Haugalandet', text: 'Hå' },{ id: 'new-Haugalandet', text: 'Klepp' },{ id: 'new-Haugalandet', text: 'Time' },{ id: 'new-Jaeren', text: 'Haugesund' },{ id: 'new-Jaeren', text: 'Bokn' },{ id: 'new-Jaeren', text: 'Tysvær' },{ id: 'new-Jaeren', text: 'Karmøy' },{ id: 'new-Jaeren', text: 'Utsira' },{ id: 'new-Jaeren', text: 'Sveio' },{ id: 'new-Ryfylke', text: 'Forsand' },{ id: 'new-Ryfylke', text: 'Strand' },{ id: 'new-Ryfylke', text: 'Hjelmeland' },{ id: 'new-Indre-Haugalandet', text: 'Suldal' },{ id: 'new-Indre-Haugalandet', text: 'Sauda' },{ id: 'new-Indre-Haugalandet', text: 'Vindafjord' },{ id: 'new-Indre-Haugalandet', text: 'Etne' },{ id: 'new-Bergen', text: 'Bergen' },{ id: 'new-Bergen', text: 'Fusa' },{ id: 'new-Bergen', text: 'Samnanger' },{ id: 'new-Bergen', text: 'Os (Hord.)' },{ id: 'new-Bergen', text: 'Austevoll' },{ id: 'new-Bergen', text: 'Sund' },{ id: 'new-Bergen', text: 'Fjell' },{ id: 'new-Bergen', text: 'Askøy' },{ id: 'new-Bergen', text: 'Vaksdal' },{ id: 'new-Bergen', text: 'Osterøy' },{ id: 'new-Bergen', text: 'Øygarden' },{ id: 'new-Sunnhordaland', text: 'Bømlo' },{ id: 'new-Sunnhordaland', text: 'Stord' },{ id: 'new-Sunnhordaland', text: 'Fitjar' },{ id: 'new-Sunnhordaland', text: 'Tysnes' },{ id: 'new-Sunnhordaland', text: 'Kvinnherad' },{ id: 'new-Voss-og-Hardanger', text: 'Jondal' },{ id: 'new-Voss-og-Hardanger', text: 'Odda' },{ id: 'new-Voss-og-Hardanger', text: 'Ullensvang' },{ id: 'new-Voss-og-Hardanger', text: 'Eidfjord' },{ id: 'new-Voss-og-Hardanger', text: 'Ulvik' },{ id: 'new-Voss-og-Hardanger', text: 'Granvin' },{ id: 'new-Voss-og-Hardanger', text: 'Voss' },{ id: 'new-Voss-og-Hardanger', text: 'Kvam' },{ id: 'new-Nord-Hordaland', text: 'Modalen' },{ id: 'new-Nord-Hordaland', text: 'Meland' },{ id: 'new-Nord-Hordaland', text: 'Radøy' },{ id: 'new-Nord-Hordaland', text: 'Lindås' },{ id: 'new-Nord-Hordaland', text: 'Austrheim' },{ id: 'new-Nord-Hordaland', text: 'Fedje' },{ id: 'new-Nord-Hordaland', text: 'Masfjorden' },{ id: 'new-Nord-Hordaland', text: 'Gulen' },{ id: 'new-Firda', text: 'Flora' },{ id: 'new-Firda', text: 'Solund' },{ id: 'new-Firda', text: 'Hyllestad' },{ id: 'new-Firda', text: 'Høyanger' },{ id: 'new-Firda', text: 'Askvoll' },{ id: 'new-Firda', text: 'Fjaler' },{ id: 'new-Firda', text: 'Gaular' },{ id: 'new-Firda', text: 'Jølster' },{ id: 'new-Firda', text: 'Førde' },{ id: 'new-Firda', text: 'Naustdal' },{ id: 'new-Firda', text: 'Bremanger' },{ id: 'new-Sogndal', text: 'Vik' },{ id: 'new-Sogndal', text: 'Balestrand' },{ id: 'new-Sogndal', text: 'Leikanger' },{ id: 'new-Sogndal', text: 'Sogndal' },{ id: 'new-Sogndal', text: 'Luster' },{ id: 'new-Laerdal', text: 'Aurland' },{ id: 'new-Laerdal', text: 'Lærdal' },{ id: 'new-Laerdal', text: 'Årdal' },{ id: 'new-Nordfjord', text: 'Vågsøy' },{ id: 'new-Nordfjord', text: 'Selje' },{ id: 'new-Nordfjord', text: 'Eid' },{ id: 'new-Nordfjord', text: 'Hornindal' },{ id: 'new-Nordfjord', text: 'Gloppen' },{ id: 'new-Nordfjord', text: 'Stryn' },{ id: 'new-Sunnmore', text: 'Ålesund' },{ id: 'new-Sunnmore', text: 'Vanylven' },{ id: 'new-Sunnmore', text: 'Sande (M. og R.)' },{ id: 'new-Sunnmore', text: 'Herøy (M. og R.)' },{ id: 'new-Sunnmore', text: 'Ulstein' },{ id: 'new-Sunnmore', text: 'Hareid' },{ id: 'new-Sunnmore', text: 'Volda' },{ id: 'new-Sunnmore', text: 'Ørsta' },{ id: 'new-Sunnmore', text: 'Ørskog' },{ id: 'new-Sunnmore', text: 'Norddal' },{ id: 'new-Sunnmore', text: 'Stranda' },{ id: 'new-Sunnmore', text: 'Stordal' },{ id: 'new-Sunnmore', text: 'Sykkylven' },{ id: 'new-Sunnmore', text: 'Skodje' },{ id: 'new-Sunnmore', text: 'Sula' },{ id: 'new-Sunnmore', text: 'Giske' },{ id: 'new-Sunnmore', text: 'Haram' },{ id: 'new-Sunnmore', text: 'Sandøy' },{ id: 'new-Romsdal', text: 'Molde' },{ id: 'new-Romsdal', text: 'Vestnes' },{ id: 'new-Romsdal', text: 'Rauma' },{ id: 'new-Romsdal', text: 'Nesset' },{ id: 'new-Romsdal', text: 'Midsund' },{ id: 'new-Romsdal', text: 'Aukra' },{ id: 'new-Romsdal', text: 'Fræna' },{ id: 'new-Romsdal', text: 'Eide' },{ id: 'new-Nordmore', text: 'Kristiansund' },{ id: 'new-Nordmore', text: 'Averøy' },{ id: 'new-Nordmore', text: 'Gjemnes' },{ id: 'new-Nordmore', text: 'Tingvoll' },{ id: 'new-Nordmore', text: 'Sunndal' },{ id: 'new-Nordmore', text: 'Surnadal' },{ id: 'new-Nordmore', text: 'Halsa' },{ id: 'new-Nordmore', text: 'Smøla' },{ id: 'new-Nordmore', text: 'Aure' },{ id: 'new-Trondheim', text: 'Rindal' },{ id: 'new-Trondheim', text: 'Trondheim' },{ id: 'new-Trondheim', text: 'Rissa' },{ id: 'new-Trondheim', text: 'Orkdal' },{ id: 'new-Trondheim', text: 'Melhus' },{ id: 'new-Trondheim', text: 'Skaun' },{ id: 'new-Trondheim', text: 'Klæbu' },{ id: 'new-Trondheim', text: 'Malvik' },{ id: 'new-Trondheim', text: 'Selbu' },{ id: 'new-Trondheim', text: 'Meråker' },{ id: 'new-Trondheim', text: 'Stjørdal' },{ id: 'new-Trondheim', text: 'Leksvik' },{ id: 'new-Kystfosen', text: 'Hemne' },{ id: 'new-Kystfosen', text: 'Snillfjord' },{ id: 'new-Kystfosen', text: 'Hitra' },{ id: 'new-Kystfosen', text: 'Frøya' },{ id: 'new-Kystfosen', text: 'Ørland' },{ id: 'new-Kystfosen', text: 'Agdenes' },{ id: 'new-Kystfosen', text: 'Bjugn' },{ id: 'new-Kystfosen', text: 'Åfjord' },{ id: 'new-Kystfosen', text: 'Roan' },{ id: 'new-Oppdalsregionen', text: 'Oppdal' },{ id: 'new-Oppdalsregionen', text: 'Rennebu' },{ id: 'new-Oppdalsregionen', text: 'Meldal' },{ id: 'new-Oppdalsregionen', text: 'Midtre Gauldal' },{ id: 'new-Rorosregionen', text: 'Os (Hedm.)' },{ id: 'new-Rorosregionen', text: 'Røros' },{ id: 'new-Rorosregionen', text: 'Holtålen' },{ id: 'new-Rorosregionen', text: 'Tydal' },{ id: 'new-Innherredsregionen', text: 'Steinkjer' },{ id: 'new-Innherredsregionen', text: 'Frosta' },{ id: 'new-Innherredsregionen', text: 'Levanger' },{ id: 'new-Innherredsregionen', text: 'Verdal' },{ id: 'new-Innherredsregionen', text: 'Verran' },{ id: 'new-Innherredsregionen', text: 'Snåase Snåsa' },{ id: 'new-Innherredsregionen', text: 'Inderøy' },{ id: 'new-Namdalskysten', text: 'Osen' },{ id: 'new-Namdalskysten', text: 'Namsos' },{ id: 'new-Namdalskysten', text: 'Namdalseid' },{ id: 'new-Namdalskysten', text: 'Overhalla' },{ id: 'new-Namdalskysten', text: 'Fosnes' },{ id: 'new-Namdalskysten', text: 'Flatanger' },{ id: 'new-Namdalskysten', text: 'Vikna' },{ id: 'new-Namdalskysten', text: 'Nærøy' },{ id: 'new-Namdalskysten', text: 'Leka' },{ id: 'new-Indre-Namdal', text: 'Lierne' },{ id: 'new-Indre-Namdal', text: 'Røyrvik' },{ id: 'new-Indre-Namdal', text: 'Namsskogan' },{ id: 'new-Indre-Namdal', text: 'Grong' },{ id: 'new-Indre-Namdal', text: 'Høylandet' },{ id: 'new-Salten', text: 'Bodø' },{ id: 'new-Salten', text: 'Meløy' },{ id: 'new-Salten', text: 'Gildeskål' },{ id: 'new-Salten', text: 'Beiarn' },{ id: 'new-Salten', text: 'Saltdal' },{ id: 'new-Salten', text: 'Fauske' },{ id: 'new-Salten', text: 'Sørfold' },{ id: 'new-Salten', text: 'Steigen' },{ id: 'new-Salten', text: 'Hábmer Hamarøy' },{ id: 'new-Salten', text: 'Divtasvuodna Tysfjord' },{ id: 'new-Salten', text: 'Røst' },{ id: 'new-Salten', text: 'Værøy' },{ id: 'new-Sor-Helgeland', text: 'Bindal' },{ id: 'new-Sor-Helgeland', text: 'Sømna' },{ id: 'new-Sor-Helgeland', text: 'Brønnøy' },{ id: 'new-Sor-Helgeland', text: 'Vega' },{ id: 'new-Sor-Helgeland', text: 'Vevelstad' },{ id: 'new-Ytre-Helgeland', text: 'Herøy (Nordl.)' },{ id: 'new-Ytre-Helgeland', text: 'Alstahaug' },{ id: 'new-Ytre-Helgeland', text: 'Dønna' },{ id: 'new-Ytre-Helgeland', text: 'Hemnes' },{ id: 'new-Midtre-Helgeland', text: 'Vefsn' },{ id: 'new-Midtre-Helgeland', text: 'Grane' },{ id: 'new-Midtre-Helgeland', text: 'Hattfjelldal' },{ id: 'new-Nordre-Helgeland', text: 'Leirfjord' },{ id: 'new-Nordre-Helgeland', text: 'Nesna' },{ id: 'new-Nordre-Helgeland', text: 'Rana' },{ id: 'new-Nordre-Helgeland', text: 'Lurøy' },{ id: 'new-Nordre-Helgeland', text: 'Træna' },{ id: 'new-Nordre-Helgeland', text: 'Rødøy' },{ id: 'new-Ofoten', text: 'Narvik' },{ id: 'new-Ofoten', text: 'Lødingen' },{ id: 'new-Ofoten', text: 'Tjeldsund' },{ id: 'new-Ofoten', text: 'Evenes' },{ id: 'new-Ofoten', text: 'Ballangen' },{ id: 'new-Lofoten', text: 'Flakstad' },{ id: 'new-Lofoten', text: 'Vestvågøy' },{ id: 'new-Lofoten', text: 'Vågan' },{ id: 'new-Lofoten', text: 'Moskenes' },{ id: 'new-Vesteralen', text: 'Hadsel' },{ id: 'new-Vesteralen', text: 'Bø (Nordl.)' },{ id: 'new-Vesteralen', text: 'Øksnes' },{ id: 'new-Vesteralen', text: 'Sortland' },{ id: 'new-Vesteralen', text: 'Andøy' },{ id: 'new-Tromso', text: 'Tromsø' },{ id: 'new-Tromso', text: 'Balsfjord' },{ id: 'new-Tromso', text: 'Karlsøy' },{ id: 'new-Tromso', text: 'Lyngen' },{ id: 'new-Tromso', text: 'Storfjord' },{ id: 'new-Harstad-regionen', text: 'Harstad' },{ id: 'new-Harstad-regionen', text: 'Kvæfjord' },{ id: 'new-Harstad-regionen', text: 'Skånland' },{ id: 'new-Harstad-regionen', text: 'Ibestad' },{ id: 'new-Harstad-regionen', text: 'Gratangen' },{ id: 'new-Midt-Troms', text: 'Lavangen' },{ id: 'new-Midt-Troms', text: 'Bardu' },{ id: 'new-Midt-Troms', text: 'Salangen' },{ id: 'new-Midt-Troms', text: 'Målselv' },{ id: 'new-Midt-Troms', text: 'Sørreisa' },{ id: 'new-Midt-Troms', text: 'Dyrøy' },{ id: 'new-Midt-Troms', text: 'Tranøy' },{ id: 'new-Midt-Troms', text: 'Torsken' },{ id: 'new-Midt-Troms', text: 'Berg' },{ id: 'new-Midt-Troms', text: 'Lenvik' },{ id: 'new-Nord-Troms', text: 'Gáivuotna Kåfjord' },{ id: 'new-Nord-Troms', text: 'Skjervøy' },{ id: 'new-Nord-Troms', text: 'Nordreisa' },{ id: 'new-Nord-Troms', text: 'Kvænangen' },{ id: 'new-Hammerfest', text: 'Hammerfest' },{ id: 'new-Hammerfest', text: 'Kvalsund' },{ id: 'new-Hammerfest', text: 'Måsøy' },{ id: 'new-Alta', text: 'Guovdageaidnu Kautokeino' },{ id: 'new-Alta', text: 'Alta' },{ id: 'new-Alta', text: 'Loppa' },{ id: 'new-Alta', text: 'Hasvik' },{ id: 'new-Tana', text: 'Berlevåg' },{ id: 'new-Tana', text: 'Deatnu Tana' },{ id: 'new-Tana', text: 'Båtsfjord' },{ id: 'new-Nordkinn', text: 'Lebesby' },{ id: 'new-Nordkinn', text: 'Gamvik' },{ id: 'new-Midt-Finnmark', text: 'Nordkapp' },{ id: 'new-Midt-Finnmark', text: 'Porsanger Porsángu Porsanki' },{ id: 'new-Midt-Finnmark', text: 'Kárásjohka Karasjok' },{ id: 'new-Varanger', text: 'Vardø' },{ id: 'new-Varanger', text: 'Vadsø' },{ id: 'new-Varanger', text: 'Unjárga Nesseby' },{ id: 'new-Varanger', text: 'Sør-Varanger' }]

  $('#municipality-selector').select2({
    placeholder: "Velg kommune",
    width: '100%',
    data: data,
    id: function(bond){ return bond._id; },
    "language": {
       "noResults": function(){
           return "Ingen kommuner";
       }
    }
  });

  $('#municipality-selector').on('change', function() {
    var selected = $(this).val();
    console.log(selected);
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
