// Display png logo when svg isn't supported (thank you @walterstephanie)
if(!Modernizr.svg) {
	var imgs = $('img[data-fallback]');
	imgs.attr('src', imgs.data('fallback'));
}

// Load map
var map = L.mapbox.map('map', 'moasth.map-pzgtnf9m,moasth.map-czvq0pvt', {minZoom: 5, maxZoom: 15, maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]]}).addControl(L.mapbox.shareControl());

// Add custom icon for share control	
$("a.mapbox-share").addClass("icon-share");

$("#js-close-page").click(function(e){
    e.preventDefault();
    e.stopPropagation();
    $("#js-page").addClass("invisible");
});

// Geolocation
if (!navigator.geolocation) {
    // do something ?
} else {
    // Add geolocation control
    $(".leaflet-control-mapbox-share").append('<a id="geolocate" class="icon-gpsoff-gps"></a>');
	var geolocate = document.getElementById('geolocate');
    
    geolocate.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        map.locate();
    };
}

// Once we've got a position, zoom and center the map on it, and add a single marker.
map.on('locationfound', function(e) {
	map.markerLayer.clearLayers();
	$("#geolocate").removeClass("icon-gpsoff-gps").addClass("icon-gpson");
    map.fitBounds(e.bounds);

	map.markerLayer.setGeoJSON({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [e.latlng.lng, e.latlng.lat]
        },
        properties: {
        	'title': 'Votre position',
            'marker-color': '#EC3C4D'
        }
    });
});

// If the user chooses not to allow their location to be shared, display an error message.
map.on('locationerror', function() {
    // do something ?
});

function getContent(t){
    	var nocontent = "<p>Aucune information n'est disponible</p>";
    	var $sidebox = $("#js-sidebox"); 
    	$sidebox.addClass("loading");
    	var $title = $sidebox.find("h1");
    	var $paragraphs = $sidebox.find("p");
    	jqxhr = 
    	$.ajax( {url: "http://fr.wikipedia.org/w/api.php?format=json&action=query&titles="+t+"&prop=extracts", dataType: "jsonp" })
    	.done(function(json) { var pages = json.query.pages;
    		var pageKey = Object.keys(pages)[0];
    		var content = "";
    		$paragraphs.remove();
    		if(pages && pageKey && pages[pageKey].extract) {
    			content = pages[pageKey].extract;
    			content = content.replace(/\[modifier\]/gi,"");
    		}
    		else {
    			content = nocontent;
    		}
    		$(content).insertAfter($title);
    		$sidebox.find("ul.gallery").remove();
    		var $todelete = $("#js-sidebox h2:contains(Notes et références), #js-sidebox h2:contains(Articles connexes), #js-sidebox h2:contains(Liens externes), #js-sidebox h2:contains(Bibliographie)");
    		$todelete.nextAll().remove(); 
    		$todelete.remove();
    	})
    	.fail(function(jqXHR, textStatus, errorThrown) { $paragraphs.remove();
    		if(textStatus != 'abort') $(nocontent).insertAfter($title); })
    	.always(function() { $sidebox.removeClass("loading");})
    }

	// cf. http://jsfiddle.net/paulovieira/RvRPh/1/
	function setSelectedIcon(e) {
		var layer = e.target;
	    var iconElem = L.DomUtil.get(layer._icon);
	    iconElem.src = 'http://a.tiles.mapbox.com/v3/marker/pin-l-circle-stroked+24A6E8.png';
	   	iconElem.style.height = '90px';
	    iconElem.style.width = '35px';
	    iconElem.style.marginLeft = '-17.5px';
	    iconElem.style.marginTop = '-45px';
	}

	function setDefaultIcon(e) {
		var layer = e.target == null ? e : e.target;
		var iconElem = L.DomUtil.get(layer._icon);
		// Non défini si le marker sélectionné se retrouve dans un cluster après dézoom
	    if(iconElem) {
		    iconElem.src = 'http://a.tiles.mapbox.com/v3/marker/pin-m+24A6E8.png';
		    iconElem.style.height = '70px';
		    iconElem.style.width = '30px';
		    iconElem.style.marginLeft = '-15px';
		    iconElem.style.marginTop = '-35px';
		}
	}

	var selectedIcon;
	var selectedLayer;
	var defaultIcon;

	function onEachFeature(f, l) {
   		f['marker-color'] = '#24A6E8';
    	defaultIcon = L.mapbox.marker.icon(f);
    	l.setIcon(defaultIcon);
    }

	// Add features to the map
	$.getJSON('../data/chateaux.geojson', function(geojson) {
		var layer = L.geoJson(geojson, {
            onEachFeature: onEachFeature
        }); 

        layer.eachLayer(function (layer) {
        	layer.on({
        		click: function(e){

        			if(selectedLayer){
    					setDefaultIcon(selectedLayer);
    				}

    				selectedLayer = layer;
					setSelectedIcon(e);

                    $("#js-page").removeClass("invisible");

					var prop = e.target.feature.properties;

					if (prop) {
						var $title = $(".content h1");
						if (prop.name === $title.html()) return;             	
						$title.html(prop.name);
						$('.content h1~*').remove();
						if (prop.wikipedia) getContent(prop.wikipedia);              
						else {
							if(jqxhr && jqxhr.readystate != 4){
								jqxhr.abort();
							}
							$("<p>Aucune information n'est disponible</p>").insertAfter(".content h1");
						}
					}
				}
			});
        });

        var markers = new L.MarkerClusterGroup({
        	showCoverageOnHover: false,
        	maxClusterRadius: 35
        });
        
        markers.addLayer(layer);
        map.addLayer(markers);
        map.setZoom(8)

    });

	var jqxhr;
