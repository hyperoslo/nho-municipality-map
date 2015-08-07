$(document).ready(function() {

  document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
  }, false); 

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

  var selectMunicipality = function(muni, animation) {
    if(muni) {
      bbox = Snap.select('#'+muni).getBBox();
      var iframeLink = $('#embed-content').val();
      $('#embed-content').val(iframeLink.replace(/\?m=(.+?)&/, '?m=' + muni + '&'));
    }
    var maxWidthScale = (4000.0/bbox.width);
    var maxHeightScale = (4000.0/bbox.height);

    // Choose the lowes scale so that the whole piece fits 
    scale = maxWidthScale <= maxHeightScale ? maxWidthScale: maxHeightScale;
    scale = scale * 0.6

    console.log(scale);

    scale = scale <= 11 ? scale : 11;

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

  var zoomInn = function() {
    var viewBox = mapSVG.attr('viewBox');
    var oldScale = (4000/viewBox.width);
    scale = ((+oldScale)*1.3);
    if(scale >=25) {
      return;
    }
    scaleMap(scale);
    $('#zoom').val(scale)
  }

  var zoomOut = function() {
    var viewBox = mapSVG.attr('viewBox');
    var oldScale = (4000/viewBox.width);
    scale = ((+oldScale)/1.3);
    if(scale <=0.9) {
      return;
    }
    scaleMap(scale);
    $('#zoom').val(scale)
  }

  $('#zoomInn').on('click', function() {
    zoomInn()
  });
  $('#zoomOut').on('click', function() {
    zoomOut()
  });

  $('#zoomInn').on('tap', function() {
    zoomInn()
  });
  $('#zoomOut').on('tap', function() {
    zoomOut()
  });

  var backToMap = function(animation) {
    if (noClicking) {
      noClicking = false;
      return;
    };
    var iframeLink = $('#embed-content').val();
    $('#embed-content').val(iframeLink.replace(/\?m=(.+?)&/, '?m=###&'));
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
      zoomInn();
    } else {
      zoomOut();
    }
    e.preventDefault();
    return false;
  });

  $('.new-municipality').click(function(){
    if (noClicking) {
      noClicking = false;
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

  $('.svg-bg').on( "tap", function( event ) { 
    backToMap(500);
  });

  $('.svg-bg').click(function() {
    backToMap(500);
  });

  var data = [{id: 'backToMap', text: 'Hele Norge'},{ id: 'new-Kystfosen', text: 'Agdenes' },{ id: 'new-Ytre-Helgeland', text: 'Alstahaug' },{ id: 'new-Alta', text: 'Alta' },{ id: 'new-Tynset', text: 'Alvdal' },{ id: 'new-Sandefjord', text: 'Andebu' },{ id: 'new-Vesteralen', text: 'Andøy' },{ id: 'new-Halden', text: 'Aremark' },{ id: 'new-Ostre-Agder', text: 'Arendal' },{ id: 'new-Akershus-vest', text: 'Asker' },{ id: 'new-Indre-Ostfold', text: 'Askim' },{ id: 'new-Firda', text: 'Askvoll' },{ id: 'new-Bergen', text: 'Askøy' },{ id: 'new-Lindesnes-regionen', text: 'Audnedal' },{ id: 'new-Romsdal', text: 'Aukra' },{ id: 'new-Nordmore', text: 'Aure' },{ id: 'new-Laerdal', text: 'Aurland' },{ id: 'new-Nedre-Romerike', text: 'Aurskog-Høland' },{ id: 'new-Bergen', text: 'Austevoll' },{ id: 'new-Nord-Hordaland', text: 'Austrheim' },{ id: 'new-Nordmore', text: 'Averøy' },{ id: 'new-Sogndal', text: 'Balestrand' },{ id: 'new-Ofoten', text: 'Ballangen' },{ id: 'new-Tromso', text: 'Balsfjord' },{ id: 'new-Grenland', text: 'Bamble' },{ id: 'new-Midt-Troms', text: 'Bardu' },{ id: 'new-Salten', text: 'Beiarn' },{ id: 'new-Midt-Troms', text: 'Berg' },{ id: 'new-Bergen', text: 'Bergen' },{ id: 'new-Tana', text: 'Berlevåg' },{ id: 'new-Sor-Helgeland', text: 'Bindal' },{ id: 'new-Kristiansand', text: 'Birkenes' },{ id: 'new-Dalane', text: 'Bjerkreim' },{ id: 'new-Kystfosen', text: 'Bjugn' },{ id: 'new-Salten', text: 'Bodø' },{ id: 'new-Jaeren', text: 'Bokn' },{ id: 'new-Firda', text: 'Bremanger' },{ id: 'new-Sor-Helgeland', text: 'Brønnøy' },{ id: 'new-Setesdal', text: 'Bygland' },{ id: 'new-Setesdal', text: 'Bykle' },{ id: 'new-Akershus-vest', text: 'Bærum' },{ id: 'new-Vesteralen', text: 'Bø (Nordl.)' },{ id: 'new-Midt-Telemark', text: 'Bø (Telem.)' },{ id: 'new-Sunnhordaland', text: 'Bømlo' },{ id: 'new-Tana', text: 'Båtsfjord' },{ id: 'new-Tana', text: 'Deatnu Tana' },{ id: 'new-Salten', text: 'Divtasvuodna Tysfjord' },{ id: 'new-Gudbrandsdalen', text: 'Dovre' },{ id: 'new-Drammen', text: 'Drammen' },{ id: 'new-Grenland', text: 'Drangedal' },{ id: 'new-Midt-Troms', text: 'Dyrøy' },{ id: 'new-Ytre-Helgeland', text: 'Dønna' },{ id: 'new-Nordfjord', text: 'Eid' },{ id: 'new-Romsdal', text: 'Eide' },{ id: 'new-Voss-og-Hardanger', text: 'Eidfjord' },{ id: 'new-Indre-Ostfold', text: 'Eidsberg' },{ id: 'new-Kongsvinger', text: 'Eidskog' },{ id: 'new-Ovre-Romerike', text: 'Eidsvoll' },{ id: 'new-Dalane', text: 'Eigersund' },{ id: 'new-Elverum', text: 'Elverum' },{ id: 'new-Follo', text: 'Enebakk' },{ id: 'new-Elverum', text: 'Engerdal' },{ id: 'new-Indre-Haugalandet', text: 'Etne' },{ id: 'new-Valdres', text: 'Etnedal' },{ id: 'new-Ofoten', text: 'Evenes' },{ id: 'new-Setesdal', text: 'Evje og Hornnes' },{ id: 'new-Lister-regionen', text: 'Farsund' },{ id: 'new-Salten', text: 'Fauske' },{ id: 'new-Nord-Hordaland', text: 'Fedje' },{ id: 'new-Nedre-Romerike', text: 'Fet' },{ id: 'new-Nord-Jaeren', text: 'Finnøy' },{ id: 'new-Sunnhordaland', text: 'Fitjar' },{ id: 'new-Firda', text: 'Fjaler' },{ id: 'new-Bergen', text: 'Fjell' },{ id: 'new-Lofoten', text: 'Flakstad' },{ id: 'new-Namdalskysten', text: 'Flatanger' },{ id: 'new-Lister-regionen', text: 'Flekkefjord' },{ id: 'new-Kongsberg', text: 'Flesberg' },{ id: 'new-Firda', text: 'Flora' },{ id: 'new-Hallingdal', text: 'Flå' },{ id: 'new-Tynset', text: 'Folldal' },{ id: 'new-Ryfylke', text: 'Forsand' },{ id: 'new-Namdalskysten', text: 'Fosnes' },{ id: 'new-Nedre-Glomma', text: 'Fredrikstad' },{ id: 'new-Follo', text: 'Frogn' },{ id: 'new-Ostre-Agder', text: 'Froland' },{ id: 'new-Innherredsregionen', text: 'Frosta' },{ id: 'new-Romsdal', text: 'Fræna' },{ id: 'new-Kystfosen', text: 'Frøya' },{ id: 'new-Bergen', text: 'Fusa' },{ id: 'new-Vest-Telemark', text: 'Fyresdal' },{ id: 'new-Firda', text: 'Førde' },{ id: 'new-Nord-Troms', text: 'Gáivuotna Kåfjord' },{ id: 'new-Nordkinn', text: 'Gamvik' },{ id: 'new-Firda', text: 'Gaular' },{ id: 'new-Lillehammer', text: 'Gausdal' },{ id: 'new-Salten', text: 'Gildeskål' },{ id: 'new-Sunnmore', text: 'Giske' },{ id: 'new-Nordmore', text: 'Gjemnes' },{ id: 'new-Ovre-Romerike', text: 'Gjerdrum' },{ id: 'new-Ostre-Agder', text: 'Gjerstad' },{ id: 'new-Nord-Jaeren', text: 'Gjesdal' },{ id: 'new-Gjovik', text: 'Gjøvik' },{ id: 'new-Nordfjord', text: 'Gloppen' },{ id: 'new-Hallingdal', text: 'Gol' },{ id: 'new-Hadeland', text: 'Gran' },{ id: 'new-Midtre-Helgeland', text: 'Grane' },{ id: 'new-Voss-og-Hardanger', text: 'Granvin' },{ id: 'new-Harstad-regionen', text: 'Gratangen' },{ id: 'new-Ostre-Agder', text: 'Grimstad' },{ id: 'new-Indre-Namdal', text: 'Grong' },{ id: 'new-Kongsvinger', text: 'Grue' },{ id: 'new-Nord-Hordaland', text: 'Gulen' },{ id: 'new-Alta', text: 'Guovdageaidnu Kautokeino' },{ id: 'new-Salten', text: 'Hábmer Hamarøy' },{ id: 'new-Vesteralen', text: 'Hadsel' },{ id: 'new-Halden', text: 'Halden' },{ id: 'new-Nordmore', text: 'Halsa' },{ id: 'new-Hamar', text: 'Hamar' },{ id: 'new-Hammerfest', text: 'Hammerfest' },{ id: 'new-Sunnmore', text: 'Haram' },{ id: 'new-Sunnmore', text: 'Hareid' },{ id: 'new-Harstad-regionen', text: 'Harstad' },{ id: 'new-Alta', text: 'Hasvik' },{ id: 'new-Midtre-Helgeland', text: 'Hattfjelldal' },{ id: 'new-Jaeren', text: 'Haugesund' },{ id: 'new-Kystfosen', text: 'Hemne' },{ id: 'new-Ytre-Helgeland', text: 'Hemnes' },{ id: 'new-Hallingdal', text: 'Hemsedal' },{ id: 'new-Sunnmore', text: 'Herøy (M. og R.)' },{ id: 'new-Ytre-Helgeland', text: 'Herøy (Nordl.)' },{ id: 'new-Kystfosen', text: 'Hitra' },{ id: 'new-Midt-Telemark', text: 'Hjartdal' },{ id: 'new-Ryfylke', text: 'Hjelmeland' },{ id: 'new-Indre-Ostfold', text: 'Hobøl' },{ id: 'new-Horten-Holmestrand', text: 'Hof' },{ id: 'new-Hallingdal', text: 'Hol' },{ id: 'new-Ringerike', text: 'Hole' },{ id: 'new-Horten-Holmestrand', text: 'Holmestrand' },{ id: 'new-Rorosregionen', text: 'Holtålen' },{ id: 'new-Nordfjord', text: 'Hornindal' },{ id: 'new-Horten-Holmestrand', text: 'Horten' },{ id: 'new-Ovre-Romerike', text: 'Hurdal' },{ id: 'new-Drammen', text: 'Hurum' },{ id: 'new-Nedre-Glomma', text: 'Hvaler' },{ id: 'new-Firda', text: 'Hyllestad' },{ id: 'new-Lister-regionen', text: 'Hægebostad' },{ id: 'new-Firda', text: 'Høyanger' },{ id: 'new-Indre-Namdal', text: 'Høylandet' },{ id: 'new-Haugalandet', text: 'Hå' },{ id: 'new-Harstad-regionen', text: 'Ibestad' },{ id: 'new-Innherredsregionen', text: 'Inderøy' },{ id: 'new-Kristiansand', text: 'Iveland' },{ id: 'new-Ringerike', text: 'Jevnaker' },{ id: 'new-Voss-og-Hardanger', text: 'Jondal' },{ id: 'new-Firda', text: 'Jølster' },{ id: 'new-Midt-Finnmark', text: 'Kárásjohka Karasjok' },{ id: 'new-Tromso', text: 'Karlsøy' },{ id: 'new-Jaeren', text: 'Karmøy' },{ id: 'new-Haugalandet', text: 'Klepp' },{ id: 'new-Trondheim', text: 'Klæbu' },{ id: 'new-Kongsberg', text: 'Kongsberg' },{ id: 'new-Kongsvinger', text: 'Kongsvinger' },{ id: 'new-Grenland', text: 'Kragerø' },{ id: 'new-Kristiansand', text: 'Kristiansand' },{ id: 'new-Nordmore', text: 'Kristiansund' },{ id: 'new-Midtfylke', text: 'Krødsherad' },{ id: 'new-Hammerfest', text: 'Kvalsund' },{ id: 'new-Voss-og-Hardanger', text: 'Kvam' },{ id: 'new-Lister-regionen', text: 'Kvinesdal' },{ id: 'new-Sunnhordaland', text: 'Kvinnherad' },{ id: 'new-Vest-Telemark', text: 'Kviteseid' },{ id: 'new-Nord-Jaeren', text: 'Kvitsøy' },{ id: 'new-Harstad-regionen', text: 'Kvæfjord' },{ id: 'new-Nord-Troms', text: 'Kvænangen' },{ id: 'new-Larvik', text: 'Lardal' },{ id: 'new-Larvik', text: 'Larvik' },{ id: 'new-Midt-Troms', text: 'Lavangen' },{ id: 'new-Nordkinn', text: 'Lebesby' },{ id: 'new-Sogndal', text: 'Leikanger' },{ id: 'new-Nordre-Helgeland', text: 'Leirfjord' },{ id: 'new-Namdalskysten', text: 'Leka' },{ id: 'new-Trondheim', text: 'Leksvik' },{ id: 'new-Midt-Troms', text: 'Lenvik' },{ id: 'new-Gudbrandsdalen', text: 'Lesja' },{ id: 'new-Innherredsregionen', text: 'Levanger' },{ id: 'new-Drammen', text: 'Lier' },{ id: 'new-Indre-Namdal', text: 'Lierne' },{ id: 'new-Lillehammer', text: 'Lillehammer' },{ id: 'new-Kristiansand', text: 'Lillesand' },{ id: 'new-Lindesnes-regionen', text: 'Lindesnes' },{ id: 'new-Nord-Hordaland', text: 'Lindås' },{ id: 'new-Gudbrandsdalen', text: 'Lom' },{ id: 'new-Alta', text: 'Loppa' },{ id: 'new-Dalane', text: 'Lund' },{ id: 'new-Hadeland', text: 'Lunner' },{ id: 'new-Nordre-Helgeland', text: 'Lurøy' },{ id: 'new-Sogndal', text: 'Luster' },{ id: 'new-Lister-regionen', text: 'Lyngdal' },{ id: 'new-Tromso', text: 'Lyngen' },{ id: 'new-Laerdal', text: 'Lærdal' },{ id: 'new-Ofoten', text: 'Lødingen' },{ id: 'new-Nedre-Romerike', text: 'Lørenskog' },{ id: 'new-Hamar', text: 'Løten' },{ id: 'new-Trondheim', text: 'Malvik' },{ id: 'new-Lindesnes-regionen', text: 'Mandal' },{ id: 'new-Indre-Ostfold', text: 'Marker' },{ id: 'new-Lindesnes-regionen', text: 'Marnardal' },{ id: 'new-Nord-Hordaland', text: 'Masfjorden' },{ id: 'new-Nord-Hordaland', text: 'Meland' },{ id: 'new-Oppdalsregionen', text: 'Meldal' },{ id: 'new-Trondheim', text: 'Melhus' },{ id: 'new-Salten', text: 'Meløy' },{ id: 'new-Trondheim', text: 'Meråker' },{ id: 'new-Romsdal', text: 'Midsund' },{ id: 'new-Oppdalsregionen', text: 'Midtre Gauldal' },{ id: 'new-Nord-Hordaland', text: 'Modalen' },{ id: 'new-Midtfylke', text: 'Modum' },{ id: 'new-Romsdal', text: 'Molde' },{ id: 'new-Lofoten', text: 'Moskenes' },{ id: 'new-Moss', text: 'Moss' },{ id: 'new-Midt-Troms', text: 'Målselv' },{ id: 'new-Hammerfest', text: 'Måsøy' },{ id: 'new-Namdalskysten', text: 'Namdalseid' },{ id: 'new-Namdalskysten', text: 'Namsos' },{ id: 'new-Indre-Namdal', text: 'Namsskogan' },{ id: 'new-Ovre-Romerike', text: 'Nannestad' },{ id: 'new-Ofoten', text: 'Narvik' },{ id: 'new-Firda', text: 'Naustdal' },{ id: 'new-Drammen', text: 'Nedre Eiker' },{ id: 'new-Ovre-Romerike', text: 'Nes (Ak.)' },{ id: 'new-Hallingdal', text: 'Nes (Busk.)' },{ id: 'new-Nordre-Helgeland', text: 'Nesna' },{ id: 'new-Follo', text: 'Nesodden' },{ id: 'new-Romsdal', text: 'Nesset' },{ id: 'new-Vest-Telemark', text: 'Nissedal' },{ id: 'new-Nedre-Romerike', text: 'Nittedal' },{ id: 'new-Midt-Telemark', text: 'Nome' },{ id: 'new-Valdres', text: 'Nord-Aurdal' },{ id: 'new-Sunnmore', text: 'Norddal' },{ id: 'new-Gudbrandsdalen', text: 'Nord-Fron' },{ id: 'new-Midt-Finnmark', text: 'Nordkapp' },{ id: 'new-Kongsvinger', text: 'Nord-Odal' },{ id: 'new-Gjovik', text: 'Nordre Land' },{ id: 'new-Nord-Troms', text: 'Nordreisa' },{ id: 'new-Kongsberg', text: 'Nore og Uvdal' },{ id: 'new-Midt-Telemark', text: 'Notodden' },{ id: 'new-Namdalskysten', text: 'Nærøy' },{ id: 'new-Tonsberg', text: 'Nøtterøy' },{ id: 'new-Voss-og-Hardanger', text: 'Odda' },{ id: 'new-Oppdalsregionen', text: 'Oppdal' },{ id: 'new-Follo', text: 'Oppegård' },{ id: 'new-Trondheim', text: 'Orkdal' },{ id: 'new-Rorosregionen', text: 'Os (Hedm.)' },{ id: 'new-Bergen', text: 'Os (Hord.)' },{ id: 'new-Namdalskysten', text: 'Osen' },{ id: 'new-Oslo', text: 'Oslo kommune' },{ id: 'new-Bergen', text: 'Osterøy' },{ id: 'new-Namdalskysten', text: 'Overhalla' },{ id: 'new-Midt-Finnmark', text: 'Porsanger Porsángu Porsanki' },{ id: 'new-Grenland', text: 'Porsgrunn' },{ id: 'new-Nord-Hordaland', text: 'Radøy' },{ id: 'new-Nedre-Glomma', text: 'Rakkestad' },{ id: 'new-Nordre-Helgeland', text: 'Rana' },{ id: 'new-Nord-Jaeren', text: 'Randaberg' },{ id: 'new-Romsdal', text: 'Rauma' },{ id: 'new-Horten-Holmestrand', text: 'Re' },{ id: 'new-Tynset', text: 'Rendalen' },{ id: 'new-Oppdalsregionen', text: 'Rennebu' },{ id: 'new-Nord-Jaeren', text: 'Rennesøy' },{ id: 'new-Trondheim', text: 'Rindal' },{ id: 'new-Lillehammer', text: 'Ringebu' },{ id: 'new-Ringerike', text: 'Ringerike' },{ id: 'new-Hamar', text: 'Ringsaker' },{ id: 'new-Trondheim', text: 'Rissa' },{ id: 'new-Ostre-Agder', text: 'Risør' },{ id: 'new-Kystfosen', text: 'Roan' },{ id: 'new-Kongsberg', text: 'Rollag' },{ id: 'new-Moss', text: 'Rygge' },{ id: 'new-Nedre-Romerike', text: 'Rælingen' },{ id: 'new-Nordre-Helgeland', text: 'Rødøy' },{ id: 'new-Indre-Ostfold', text: 'Rømskog' },{ id: 'new-Rorosregionen', text: 'Røros' },{ id: 'new-Salten', text: 'Røst' },{ id: 'new-Drammen', text: 'Røyken' },{ id: 'new-Indre-Namdal', text: 'Røyrvik' },{ id: 'new-Moss', text: 'Råde' },{ id: 'new-Midt-Troms', text: 'Salangen' },{ id: 'new-Salten', text: 'Saltdal' },{ id: 'new-Bergen', text: 'Samnanger' },{ id: 'new-Sunnmore', text: 'Sande (M. og R.)' },{ id: 'new-Drammen', text: 'Sande (Vestf.)' },{ id: 'new-Sandefjord', text: 'Sandefjord' },{ id: 'new-Nord-Jaeren', text: 'Sandnes' },{ id: 'new-Sunnmore', text: 'Sandøy' },{ id: 'new-Nedre-Glomma', text: 'Sarpsborg' },{ id: 'new-Indre-Haugalandet', text: 'Sauda' },{ id: 'new-Midt-Telemark', text: 'Sauherad' },{ id: 'new-Gudbrandsdalen', text: 'Sel' },{ id: 'new-Trondheim', text: 'Selbu' },{ id: 'new-Nordfjord', text: 'Selje' },{ id: 'new-Vest-Telemark', text: 'Seljord' },{ id: 'new-Midtfylke', text: 'Sigdal' },{ id: 'new-Grenland', text: 'Siljan' },{ id: 'new-Lister-regionen', text: 'Sirdal' },{ id: 'new-Trondheim', text: 'Skaun' },{ id: 'new-Nedre-Romerike', text: 'Skedsmo' },{ id: 'new-Follo', text: 'Ski' },{ id: 'new-Grenland', text: 'Skien' },{ id: 'new-Indre-Ostfold', text: 'Skiptvet' },{ id: 'new-Nord-Troms', text: 'Skjervøy' },{ id: 'new-Gudbrandsdalen', text: 'Skjåk' },{ id: 'new-Sunnmore', text: 'Skodje' },{ id: 'new-Harstad-regionen', text: 'Skånland' },{ id: 'new-Nordmore', text: 'Smøla' },{ id: 'new-Kystfosen', text: 'Snillfjord' },{ id: 'new-Innherredsregionen', text: 'Snåase Snåsa' },{ id: 'new-Sogndal', text: 'Sogndal' },{ id: 'new-Dalane', text: 'Sokndal' },{ id: 'new-Nord-Jaeren', text: 'Sola' },{ id: 'new-Firda', text: 'Solund' },{ id: 'new-Kristiansand', text: 'Songdalen' },{ id: 'new-Vesteralen', text: 'Sortland' },{ id: 'new-Indre-Ostfold', text: 'Spydeberg' },{ id: 'new-Hamar', text: 'Stange' },{ id: 'new-Nord-Jaeren', text: 'Stavanger' },{ id: 'new-Salten', text: 'Steigen' },{ id: 'new-Innherredsregionen', text: 'Steinkjer' },{ id: 'new-Trondheim', text: 'Stjørdal' },{ id: 'new-Sandefjord', text: 'Stokke' },{ id: 'new-Sunnhordaland', text: 'Stord' },{ id: 'new-Sunnmore', text: 'Stordal' },{ id: 'new-Elverum', text: 'Stor-Elvdal' },{ id: 'new-Tromso', text: 'Storfjord' },{ id: 'new-Ryfylke', text: 'Strand' },{ id: 'new-Sunnmore', text: 'Stranda' },{ id: 'new-Nordfjord', text: 'Stryn' },{ id: 'new-Sunnmore', text: 'Sula' },{ id: 'new-Indre-Haugalandet', text: 'Suldal' },{ id: 'new-Bergen', text: 'Sund' },{ id: 'new-Nordmore', text: 'Sunndal' },{ id: 'new-Nordmore', text: 'Surnadal' },{ id: 'new-Jaeren', text: 'Sveio' },{ id: 'new-Drammen', text: 'Svelvik' },{ id: 'new-Sunnmore', text: 'Sykkylven' },{ id: 'new-Kristiansand', text: 'Søgne' },{ id: 'new-Sor-Helgeland', text: 'Sømna' },{ id: 'new-Gjovik', text: 'Søndre Land' },{ id: 'new-Valdres', text: 'Sør-Aurdal' },{ id: 'new-Salten', text: 'Sørfold' },{ id: 'new-Lillehammer', text: 'Sør-Fron' },{ id: 'new-Kongsvinger', text: 'Sør-Odal' },{ id: 'new-Midt-Troms', text: 'Sørreisa' },{ id: 'new-Nedre-Romerike', text: 'Sørum' },{ id: 'new-Varanger', text: 'Sør-Varanger' },{ id: 'new-Haugalandet', text: 'Time' },{ id: 'new-Nordmore', text: 'Tingvoll' },{ id: 'new-Midt-Telemark', text: 'Tinn' },{ id: 'new-Ofoten', text: 'Tjeldsund' },{ id: 'new-Tonsberg', text: 'Tjøme' },{ id: 'new-Vest-Telemark', text: 'Tokke' },{ id: 'new-Tynset', text: 'Tolga' },{ id: 'new-Midt-Troms', text: 'Torsken' },{ id: 'new-Midt-Troms', text: 'Tranøy' },{ id: 'new-Tromso', text: 'Tromsø' },{ id: 'new-Trondheim', text: 'Trondheim' },{ id: 'new-Elverum', text: 'Trysil' },{ id: 'new-Nordre-Helgeland', text: 'Træna' },{ id: 'new-Indre-Ostfold', text: 'Trøgstad' },{ id: 'new-Ostre-Agder', text: 'Tvedestrand' },{ id: 'new-Rorosregionen', text: 'Tydal' },{ id: 'new-Tynset', text: 'Tynset' },{ id: 'new-Sunnhordaland', text: 'Tysnes' },{ id: 'new-Jaeren', text: 'Tysvær' },{ id: 'new-Tonsberg', text: 'Tønsberg' },{ id: 'new-Ovre-Romerike', text: 'Ullensaker' },{ id: 'new-Voss-og-Hardanger', text: 'Ullensvang' },{ id: 'new-Sunnmore', text: 'Ulstein' },{ id: 'new-Voss-og-Hardanger', text: 'Ulvik' },{ id: 'new-Varanger', text: 'Unjárga Nesseby' },{ id: 'new-Jaeren', text: 'Utsira' },{ id: 'new-Varanger', text: 'Vadsø' },{ id: 'new-Bergen', text: 'Vaksdal' },{ id: 'new-Setesdal', text: 'Valle' },{ id: 'new-Valdres', text: 'Vang' },{ id: 'new-Sunnmore', text: 'Vanylven' },{ id: 'new-Varanger', text: 'Vardø' },{ id: 'new-Midtre-Helgeland', text: 'Vefsn' },{ id: 'new-Sor-Helgeland', text: 'Vega' },{ id: 'new-Ostre-Agder', text: 'Vegårshei' },{ id: 'new-Kristiansand', text: 'Vennesla' },{ id: 'new-Innherredsregionen', text: 'Verdal' },{ id: 'new-Innherredsregionen', text: 'Verran' },{ id: 'new-Follo', text: 'Vestby' },{ id: 'new-Romsdal', text: 'Vestnes' },{ id: 'new-Valdres', text: 'Vestre Slidre' },{ id: 'new-Gjovik', text: 'Vestre Toten' },{ id: 'new-Lofoten', text: 'Vestvågøy' },{ id: 'new-Sor-Helgeland', text: 'Vevelstad' },{ id: 'new-Sogndal', text: 'Vik' },{ id: 'new-Namdalskysten', text: 'Vikna' },{ id: 'new-Indre-Haugalandet', text: 'Vindafjord' },{ id: 'new-Vest-Telemark', text: 'Vinje' },{ id: 'new-Sunnmore', text: 'Volda' },{ id: 'new-Voss-og-Hardanger', text: 'Voss' },{ id: 'new-Salten', text: 'Værøy' },{ id: 'new-Lofoten', text: 'Vågan' },{ id: 'new-Nordfjord', text: 'Vågsøy' },{ id: 'new-Gudbrandsdalen', text: 'Vågå' },{ id: 'new-Kongsvinger', text: 'Våler (Hedm.)' },{ id: 'new-Moss', text: 'Våler (Østf.)' },{ id: 'new-Vesteralen', text: 'Øksnes' },{ id: 'new-Kystfosen', text: 'Ørland' },{ id: 'new-Sunnmore', text: 'Ørskog' },{ id: 'new-Sunnmore', text: 'Ørsta' },{ id: 'new-Gjovik', text: 'Østre Toten' },{ id: 'new-Drammen', text: 'Øvre Eiker' },{ id: 'new-Lillehammer', text: 'Øyer' },{ id: 'new-Bergen', text: 'Øygarden' },{ id: 'new-Valdres', text: 'Øystre Slidre' },{ id: 'new-Kystfosen', text: 'Åfjord' },{ id: 'new-Hallingdal', text: 'Ål' },{ id: 'new-Sunnmore', text: 'Ålesund' },{ id: 'new-Ostre-Agder', text: 'Åmli' },{ id: 'new-Elverum', text: 'Åmot' },{ id: 'new-Laerdal', text: 'Årdal' },{ id: 'new-Follo', text: 'Ås' },{ id: 'new-Lindesnes-regionen', text: 'Åseral' },{ id: 'new-Kongsvinger', text: 'Åsnes' }]

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

  $('.select2-search__field').attr('placeholder', 'Søk etter kommune');

  $('#municipality-selector').on('change', function() {
    var selected = $(this).val();
    if (selected == 'backToMap') {
      backToMap(500);
    } else {
      selectMunicipality(selected, 500);
    };
  });

  $('.dismiss-modal').click(function(e) {
    $('.nho-embed-modal').toggle();
    e.preventDefault();
    return false;
  });

  $('#embed-model-link').click(function(e) {
    $('.nho-embed-modal').toggle();
    e.preventDefault();
    return false;
  });

  // If linked directly with param m select the municipality with no animation
  if(queryParams.m) {
    animation_duration = parseInt(queryParams.d) || 0;
    selectMunicipality(queryParams.m, animation_duration);
  }


});
