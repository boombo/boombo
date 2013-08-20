// Display png logo when svg isn't supported (thank you @walterstephanie)
if(!Modernizr.svg) {
	var imgs = $('img[data-fallback]');
	imgs.attr('src', imgs.data('fallback'));
}

var Map = function () {
    var _map;
    var _config = {
        mapElementId: 'map',
        mapId: 'moasth.map-pzgtnf9m,moasth.map-czvq0pvt',
        options: {minZoom: 7, maxZoom: 19, maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]]},
    }

    var init = function (p_options) {
        // copy properties of `options` to `config`. Will overwrite existing ones.
        for(var prop in p_options) {
            if(p_options.hasOwnProperty(prop)){
                _config[prop] = p_options[prop];
            }
        }
        _map = L.mapbox.map(_config.mapElementId, _config.mapId, _config.options);
        _addFeatures();
        _geolocate();
    };

    var _geolocate = function () {
        if (!Modernizr.geolocation) {
            // do something ?
        } else {
            // Add geolocation control
            // TODO: change because mapbox share control removed
            $(".leaflet-control-zoom").append('<a id="geolocate" class="icon-gpsoff-gps"></a>');
            var geolocate = document.getElementById('geolocate');
            geolocate.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                _map.locate();
            };
        }

        // Once we've got a position, zoom and center the map on it, and add a single marker.
        _map.on('locationfound', function(e) {
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
                    'title': 'Votre position actuelle',
                    'marker-color': '#EC3C4D'
                }
            });
        });

        // If the user chooses not to allow their location to be shared, display an error message.
        _map.on('locationerror', function() {
            // do something ?
        });
    };

    var _jqxhr;

    var _getContent = function (t) {
        var nocontent = "<p>Aucune information n'est disponible</p>";
        var $page = $("#js-page"); 
        $page.addClass("loading");
        var $title = $page.find("h1");
        var $paragraphs = $page.find("p");
        _jqxhr = 
            $.ajax( {url: "http://fr.wikipedia.org/w/api.php?format=json&action=query&titles="+t+"&prop=extracts", dataType: "jsonp" })
            .done(function(json) { 
                var pages = json.query.pages;
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
                $page.find("ul.gallery").remove();
                var $todelete = $("#js-page h2:contains(Notes et références), #js-page h2:contains(Articles connexes), #js-page h2:contains(Liens externes), #js-page h2:contains(Bibliographie)");
                $todelete.nextAll().remove(); 
                $todelete.remove();
            })
            .fail(function(_jqXHR, textStatus, errorThrown) { 
                $paragraphs.remove();
                if(textStatus != 'abort') $(nocontent).insertAfter($title); 
            })
            .always(function() { $page.removeClass("loading");})
    };

    function _setIcon(e, isSelected) {
        var iconUrl = 'http://a.tiles.mapbox.com/v3/marker/';
        var layer = e.target == null ? e : e.target;
        var iconElem = L.DomUtil.get(layer._icon);
        var icon, height, width, marginLeft, marginTop;

        if (isSelected) {
            icon = 'pin-l-circle-stroked+24A6E8.png';
            height = '90px';
            width = '35px';
            marginLeft = '-17.5px';
            marginTop = '-45px';
        } else {
            icon = 'pin-m+24A6E8.png';
            height = '70px';
            width = '30px';
            marginLeft = '-15px';
            marginTop = '-35px';
        }

        // Non défini si le marker sélectionné se retrouve dans un cluster après dézoom
        if(iconElem) {
            iconElem.src = iconUrl + icon;
            iconElem.style.height = height;
            iconElem.style.width = width;
            iconElem.style.marginLeft = marginLeft;
            iconElem.style.marginTop = marginTop;
        }
    };

    var _selectedIcon;
    var _selectedLayer;
    var _defaultIcon;

    function _onEachFeature(f, l) {
        f['marker-color'] = '#24A6E8';
        _defaultIcon = L.mapbox.marker.icon(f);
        l.setIcon(_defaultIcon);
    };

    function _addFeatures () {
        $.getJSON('../data/chateaux.geojson', function(geojson) {
            var layer = L.geoJson(geojson, {
                onEachFeature: _onEachFeature
            }); 

            layer.eachLayer(function (layer) {
                layer.on({
                    click: function(e){
                        if(_selectedLayer){
                            _setIcon(_selectedLayer, false);
                        }
                        _selectedLayer = layer;
                        _setIcon(e, true);
                        $("#js-page").removeClass("invisible");
                        var prop = e.target.feature.properties;

                        if (prop) {
                            var $title = $("#js-page h1");
                            if (prop.name === $title.html()) return;                
                            $title.html(prop.name);
                            $('#js-page h1~*').remove();
                            if (prop.wikipedia) _getContent(prop.wikipedia);              
                            else {
                                if(_jqxhr && _jqxhr.readystate != 4){
                                    _jqxhr.abort();
                                }
                                $("<p>Aucune information n'est disponible</p>").insertAfter("#js-page h1");
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
            _map.addLayer(markers);
            _map.setZoom(8)
        });
    };

    return {
        init: init
    };
}();

Map.init();

$("#js-close-page").click(function(e){
    e.preventDefault();
    e.stopPropagation();
    $("#js-page").addClass("invisible");
});