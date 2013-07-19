var myMap = (function($j) {
  var _map;

 	// *** Private options 
  	var _options = {
	    mapOptions: {
	    	minZoom: 5,
	    	maxZoom: 15,
	    	maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]]
	    },
	    controlsOptions: {
	    	isZoomControlEnabled: true,
	    	isShareEnabled: true,
	    	isGeolocationEnabled: true
	    }
  	};

  	function _setOptions(p_optionToSet, p_optionNewValues){
  		if ( p_optionNewValues != null && p_optionNewValues != undefined && p_optionNewValues != 'undefined' ){
		    for ( var opt in p_optionToSet ) {
		      	if ( p_optionNewValues[ opt ] != null
		           && p_optionNewValues[ opt ] != undefined
		           && p_optionNewValues[ opt ] != 'undefined' ){
		        	p_optionToSet[ opt ] = p_optionNewValues[ opt ];
		      	}
		    }
	  	}
  	}

  	function _setMapOptions(p_mapOptions){
  		_setOptions(_options.mapOptions, p_mapOptions);
  	}

  	function _setControlsOptions(p_controlsOptions){
  		_setOptions(_options.controlsOptions, p_controlsOptions);
  	}

  	// *** Public methods
  	// Set the options if provided any. This options pattern is from Mootools, and thier library will do it for you for free!
  	function init(p_mapElementId, p_mapId, p_mapOptions, p_controlsOptions){
  		_setMapOptions(p_mapOptions);
  		_setControlsOptions(p_controlsOptions);
	  	_map = L.mapbox.map(p_mapElementId, p_mapId, _options.mapOptions})

	  	if(controlsOptions.isShareEnabled){
	  		_map.addControl(L.mapbox.shareControl());
	  		// Add custom icon for share control	
			// TODO TSC -> vanilla
			$j("a.mapbox-share").addClass("icon-share");
	  	}
		
		if(controlsOptions.isGeolocationEnabled){
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
        			_map.locate();
    			};
			}

			// Once we've got a position, zoom and center the map on it, and add a single marker.
			_map.on('locationfound', function(e) {
				// TODO TSC : do not clear but move the marker if it already exists
				_map.markerLayer.clearLayers();
				$("#geolocate").removeClass("icon-gpsoff-gps").addClass("icon-gpson");
	    		_map.fitBounds(e.bounds);

				_map.markerLayer.setGeoJSON({
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
			_map.on('locationerror', function() {
    			// do something ?
			});
	  	}

	  	if(!controlsOptions.isZoomControlEnabled){
	  		// TODO TSC : masquer zoom
	  	}
	}

	return {
        init: init;
    }

}(jQuery));
