// Display png logo when svg isn't supported (thank you @walterstephanie)
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

                        var prop = e.target.feature.properties;
                        Content.display(prop.name, prop.wikipedia);
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

var Content = function () {
    // Configuration and CSS classes + ids
    var _config = {
        css:{
            closePageId: '#js-close-page',
            pageId: '#js-page',
            invisibleClass: 'invisible',
            loadingClass: 'loading'
        },
        labels:{
            /*next:'next',
            previous:'back',
            auto:'play'*/
        },
        settings:{
            contentURL: "http://fr.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exchars=2000&titles=",
            noContentString: "Aucune information n'est disponible", 
        }
    };

    // Shortcuts
    var _css = _config.css;
    var _labels = _config.labels;
    var _settings = _config.settings;

    // Template
    /*var _contentTpl = '<a id="js-close-page" class="close-icon" href="#">Fermer la page</a> 
    <h1> {{name}} </h1> 
    <div class="images">  
        <div style="float: left;height: 100%;width: 33.33%;">
            <img src="http://res.cloudinary.com/diy8beggy/image/upload/nopic_oifgyp.png" class="img-polaroid" style="margin: auto;display: inline-block;">
        </div>
        <div style="float: left;width: 33.33%;">
            <img src="http://res.cloudinary.com/diy8beggy/image/upload/nopic_oifgyp.png" class="img-polaroid" style="margin: auto;display: inline-block;">
        </div>
        <div style="float: left;width: 33.33%;">
            <img src="http://res.cloudinary.com/diy8beggy/image/upload/nopic_oifgyp.png" class="img-polaroid" style="margin: auto;display: inline-block;">
        </div>
    </div>
    {{content}}';*/

    // Other private variables
    /* var _map;*/
    var _$page;
    var _$title;
    var _$paragraphs;
    var _jqxhr;

    var init = function (p_options) {
        // copy properties of `options` to `config`. Will overwrite existing ones.
        for(var prop in p_options) {
            if(p_options.hasOwnProperty(prop)){
                _config[prop] = p_options[prop];
            }
        }

        // Fermeture de la pop-up de contenu sur mobile
        $(_css.closePageId).click(function(e){
            e.preventDefault();
            e.stopPropagation();
            $(_css.pageId).addClass(_css.invisibleClass);
        });
    };

    var display = function (p_name, p_id) {
        _$page = $(_css.pageId);
        _$title = _$page.find("h1");
        _$paragraphs = _$page.find("p");  

        if (p_name === _$title.html()) return;                
        // TODO : optimiser avec templates
        _$title.html(p_name);
        //$('#js-page h1~*').remove();
        _deleteText();

        if (p_id) _getContent(p_id);              
        else {
            _abortPreviousRequest();
            _displayNoContentString();
        }
    }
   
    var _abortPreviousRequest = function () {
        if(_jqxhr && _jqxhr.readystate != 4){
            _jqxhr.abort();
        }
    }

    var _getContent = function (t) {
        _addLoading();
        _jqxhr = 
            $.ajax( {url: _settings.contentURL+t, dataType: "jsonp" })
            .done(function(json) { 
                _displayContent(json);    
            })
            .fail(function(_jqXHR, textStatus, errorThrown) { 
                if(textStatus != 'abort') 
                    _displayNoContentString(); 
            })
            .always(function() { 
                _removeLoading();
            })
    };

     var _addLoading = function () {
        _$page.addClass(_css.loadingClass);
    }

    var _removeLoading = function () {
        _$page.removeClass(_css.loadingClass);  
    }

    var _displayNoContentString = function () {
        _deleteParagraphs();
        $("<p>" + _settings.noContentString + "</p>").insertAfter(_$title);
    }

    // TODO : à revoir / optimiser
    var _deleteParagraphs = function () {
        _$paragraphs.remove();
    }

    var _deleteText = function () {
        $('#js-page h1~*').remove();
    }

    var _displayContent = function (json) {
        var pages = json.query.pages;
        var pageKey = Object.keys(pages)[0];
        var content = "";
        // Suppression du contenu (paragraphes)
        //_deleteParagraphs();
        _deleteText();
        
        // Récupération content
        if(pages && pageKey && pages[pageKey].extract) {
            content = pages[pageKey].extract;
            content = content.replace(/\[modifier\]/gi,"");
            
            $(content).find("ul.gallery").remove();
            //var $todelete = $("#js-page h2:contains(Notes et références), #js-page h2:contains(Articles connexes), #js-page h2:contains(Liens externes), #js-page h2:contains(Bibliographie)");
            var $todelete = $(content).find("h2:contains(Notes et références)");
            $todelete.add($(content).find("h2:contains(Articles connexes)")); 
            $todelete.add($(content).find("h2:contains(Liens externes)"));         
            $todelete.add($(content).find("h2:contains(Bibliographie)"));         
            $todelete.nextAll().remove(); 
            $todelete.remove();

            /*var html = Mustache.render(contentTpl, {name: _$title.html(), content: content});*/
            //var _contentTpl = "<h1> {{name}} </h1>"
            var html = ich.contentTpl({name: _$title.html()});
            /*var html = Mustache.render(contentTpl, {name: 'titre'});*/
            $(html).find("#text").html(content);
            _$page.html(html);

            //$(content).insertAfter(_$title);
        }
        else {
           _displayNoContentString();
        }
        
       
    }

    return {
        init: init,
        display: display
    };
}();

Map.init();
Content.init();
