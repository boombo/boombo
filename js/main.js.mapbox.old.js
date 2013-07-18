$(document).ready(function(){
    //mapbox.auto('map', 'examples.map-vyofok3q');
	//mapbox.auto('map', ['http://a.tiles.mapbox.com/v3/moasth.map-pzgtnf9m,moasth.map-czvq0pvt,moasth.chateaux.jsonp', 'http://a.tiles.mapbox.com/v3/moasth.map-pzgtnf9m,moasth.map-czvq0pvt.jsonp'], function(map, details){
		mapbox.auto('map', ['http://a.tiles.mapbox.com/v3/moasth.map-pzgtnf9m,moasth.map-czvq0pvt,moasth.chateaux.jsonp'], function(map, details){
    	//var layers = document.getElementById('map-ui');
    	map.disableLayerAt(1);
    	//map.ui.hash.add();
    	//map.interaction.auto().off('on').off('off').on(wax.movetip().parent(map.parent).events());
    	map.interaction.auto().on({
    		on: function(o) {
    			if (o.e.type === "click")            
    			{
    				var $title = $(".content h1");
    				if (o.data.name === $title.html()) return;             	
    				$title.html(o.data.name);
    				$('.content h1~*').remove();
    				if (o.data.wikipedia) getWkpdData(o.data.wikipedia);              
    				else {
    					if(jqxhr && jqxhr.readystate != 4){
    						jqxhr.abort();
    					}
    					$("<p>Aucune information n'est disponible</p>").insertAfter(".content h1");
    				}
    			}
    		}
    	});

    	map.setZoomRange(6, 15);
    	map.setPanLimits([{lat: 35.3073, lon: -19.6518}, {lat: 59.5726, lon: 34.0933}]);

     	// Attribute map
     	map.ui.attribution.add()
     	.content('<a href="http://mapbox.com/about/maps">Terms &amp; Feedback</a>');

     	$('.zoomer').wrapAll('<div class="zoom" />');
     });

$(".content").niceScroll({cursorborder: "none", cursorwidth: "8px", cursorborderradius:0, cursoropacitymin:0.25 , cursorcolor:"#24A6E8"});

$('.nav-pills a').on("click", function(e) {
	var  $this = $(this);
	$("div.navbar ul.nav-pills li.active").removeClass("active");
	$this.parent("li").addClass("active");
	var     id = $this.attr('id'),
	contentId = '#' + id + '-content',
	$data = $(contentId).html();
	$('.content').html($data);
});

var jqxhr;

function getWkpdData(t){
	$(".content").addClass("loading");
	jqxhr = 
	$.ajax( {url: "http://fr.wikipedia.org/w/api.php?format=json&action=query&titles="+t+"&prop=extracts", dataType: "jsonp" })
	.done(function(json) { var pages = json.query.pages;
		var pageKey = Object.keys(pages)[0];
		var $content = $(".content p");
		var $title = $(".content h1");
		$content.remove();
		if(pages && pageKey && pages[pageKey].extract)
			$(pages[pageKey].extract).insertAfter($title);
		else
			$("<p>Aucune information n'est disponible</p>").insertAfter(".content h1"); 
	})
	.fail(function(jqXHR, textStatus, errorThrown) { $(".content p").remove();
		if(textStatus != 'abort') $("<p>Aucune information n'est disponible</p>").insertAfter(".content h1"); })
	.always(function() { $(".content").removeClass("loading");})
}
});



