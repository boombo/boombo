// Display png logo when svg isn't supported (thank you @walterstephanie)
// Update
if(!Modernizr.svg) {
	var imgs = $('img[data-fallback]');
	imgs.attr('src', imgs.data('fallback'));
}

var Map = function () {
    var _config = {
        mapElementId: 'map',
        mapId: 'moasth.map-pzgtnf9m,moasth.map-czvq0pvt',
        options: {minZoom: 7, maxZoom: 19, maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]], detectRetina: true, retinaVersion: 'moasth.map-14d5d9tc,moasth.map-wdsgqecq'}
    }

    // Other local variables
    var _map;
    var _layer;
    var _selectedIcon;
    var _selectedLayer;
    var _defaultIcon;
    
    var init = function (p_options) {
        // copy properties of `options` to `config`. Will overwrite existing ones.
        for(var prop in p_options) {
            if(p_options.hasOwnProperty(prop)){
                _config[prop] = p_options[prop];
            }
        }
        _map = L.mapbox.map(_config.mapElementId, _config.mapId, _config.options);
        _map.addControl(L.mapbox.geocoderControl(_config.mapId));

        $(".leaflet-control-mapbox-geocoder").find('a')
            .removeClass('mapbox-icon')
            .removeClass('mapbox-icon-geocoder')
            .addClass('icon-search');

        _addFeatures();
        _geolocate();
    };

    var _addGeolocationControl = function () {
        $(".leaflet-control-zoom").append('<a id="geolocate" class="icon-gpsoff-gps"></a>');
    }

    var _geolocate = function () {
        if (!Modernizr.geolocation) {
            // do something ?
        } else {
            _addGeolocationControl();            

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

    function _onEachFeature(f, l) {
        f['marker-color'] = '#24A6E8';
        _defaultIcon = L.mapbox.marker.icon(f);
        l.setIcon(_defaultIcon);
    };

    function _addFeatures () {
        $.getJSON('../data/chateaux.geojson', function(geojson) {
            _layer = L.geoJson(geojson, {
                onEachFeature: _onEachFeature
            }); 

            _layer.eachLayer(function (p_layer) {
                p_layer.on({
                    click: function(e){
                        if(_selectedLayer){
                            _setIcon(_selectedLayer, false);
                        }
                        _selectedLayer = p_layer;
                        _setIcon(e, true);

                        var prop = e.target.feature.properties;
                        Content.display(prop.name, prop.wikipedia, prop.pics);
                    }
                });
            });

            var markers = new L.MarkerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 35
            });
            
            markers.addLayer(_layer);
            _map.addLayer(markers);
            _map.setZoom(8)
        });
    };

    return {
        init: init
    };
}();

var Content = function () {
    // Configuration and CSS classes + ids
    var _config = {
        css:{
            closePageId: '#js-close-page',
            pageId: '#js-page',
            textId: "#text",
            invisibleClass: 'invisible',
            loadingClass: 'loading'
        },
        settings:{
            contentURL: "http://fr.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exchars=2000&titles=",
        }
    };

    // Shortcuts
    var _css = _config.css;
    var _labels = _config.labels;
    var _settings = _config.settings;

    // Other private variables
    var _$page = $(_css.pageId);
    var _name;
    var _id;
    var _pics;
    var _jqxhr;

    var init = function (p_options) {
        // copy properties of `options` to `config`. Will overwrite existing ones.
        for(var prop in p_options) {
            if(p_options.hasOwnProperty(prop)){
                _config[prop] = p_options[prop];
            }
        }

        // Fermeture de la pop-up de contenu sur mobile
        _$page.find(_css.closePageId).click(function(e){
            e.preventDefault();
            e.stopPropagation();
            _$page.addClass(_css.invisibleClass);
        });
    };

    var display = function (p_name, p_id, p_pics) {
        //_$page.removeClass(_css.invisibleClass);
        var title = $.trim(_$page.find("h1").html());
        _name = $.trim(p_name);
        _id = p_id; 
        _pics = $.trim(p_pics);

        if (_name === title) {
            _$page.removeClass(_css.invisibleClass);
            return;
        }

        _setTitle(_name);
        /*_$page.removeClass(_css.invisibleClass);*/

        if (!p_id) {
            if(_jqxhr && _jqxhr.readystate != 4) _jqxhr.abort();
            _setNoContent();
            return;
        }

        _$page.addClass(_css.loadingClass);

        _jqxhr = $.ajax( {url: _settings.contentURL+p_id, dataType: "jsonp" })
            .done(function(json) { 
                _displayContent(json);    
            })
            .fail(function(_jqXHR, textStatus, errorThrown) { 
                if(textStatus != 'abort') 
                    _setNoContent();
            })
            .always(function() { 
                _$page.removeClass(_css.loadingClass);  
            });    
    }
   
    var _arrayToObjectLiteral = function (p_array) {
        var obj = [];

        for (idx in p_array) {
            obj.push ({'index': idx+1, 'picId': p_array[idx]});
        }

        return obj;
    };

    var _setTitle = function (p_title) {
        var html = ich.titleTpl({name: p_title});
        _$page.find(".description").html(html); 
        /*_$page.removeClass(_css.invisibleClass);*/
    }

    var _setNoContent = function () {
        var html = ich.noInfoTpl({name: _name});
        _$page.find(".description").html(html); 
        _$page.removeClass(_css.invisibleClass);
    }

    var _cleanContent = function (content) {
            var toDeleteArray = [
                "ul.gallery",
                "h2:contains(Notes et références)",
                "h2:contains(Articles connexes)",
                "h2:contains(Liens externes)", 
                "h2:contains(Bibliographie)",
                "h2:contains(Voir aussi)",
                "h2:contains(Références)",
                "h3:contains(Articles connexes)",
                "h3:contains(Liens externes)",
            ];

            var $content = $('<div>').append(content);
            var $todelete = $();
            var toDeleteLength = toDeleteArray.length;

            for (var i = 0; i < toDeleteLength; i++) {
                $todelete = $todelete.add($content.find(toDeleteArray[i]));                
            }

            $todelete.nextAll().remove(); 
            $todelete.remove();
            return $content;
    }

var _getPicsLayout = function () {
	    var picsObj = {};
            var picsArray = [];
            var picsStrArray = _pics.split(',');
            var picsLength = picsStrArray.length;

	    if (picsLength === 1 && picsStrArray[0] === "") return "";

            var _cleanedId = _id.replace(/[(,),\'']/g, '_');
	    
            //if (picsLength === 3) {
                for (var i = 0; i < picsLength; i++) {
                    var picObj = {};
                    picObj.index = i+1;
                    picObj.picId = picsStrArray[i];
                    picObj.castleId = _cleanedId;
                    picObj.alt = _name;
                    picsArray.push(picObj);
                }
	    
	    var picsArrayLength = picsArray.length;

	     if (picsArrayLength < 3) {
	     	for (var i = 0; i < 3 - picsArrayLength; i++) {
	     		var picObj = {};
                        //picObj.index = i+1;
                        //picObj.picId = picsStrArray[i];
                        picObj.picId = "oifgyp";
                        picObj.castleId = "nopic";
                        picObj.alt = "Photo indisponible";
                        picsArray.push(picObj);	
	     	} 
	     }

                picsObj.images = picsArray;
                return ich.imagesTpl(picsObj);
            //}
}

    var _displayContent = function (json) {
        var pages = json.query.pages;
        var pageKey = Object.keys(pages)[0];
        var content = "";

        // Récupération content
        if(pages && pageKey && pages[pageKey].extract) {
            content = pages[pageKey].extract;
            content = content.replace(/\[modifier\]/gi,"");
            
            var $content = _cleanContent(content);
            var contentObj = {name: _name, castleId: _id};
            var contentHtml = ich.contentTpl(contentObj);
            var imagesHtml = _getPicsLayout();

            _$page.find(".description").html(contentHtml);
            _$page.find("#text").html($content);
            _$page.find("div.images").html(imagesHtml);
        }
        else {
           _setNoContent();
        }
        _$page.removeClass(_css.invisibleClass);
    }

    return {
        init: init,
        display: display
    };
}();

Map.init();
Content.init();
