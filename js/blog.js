// Display png logo when svg isn't supported (thank you @walterstephanie)
if(!Modernizr.svg) {
	var imgs = $('img[data-fallback]');
	imgs.attr('src', imgs.data('fallback'));
}

// Load map
var map = L.mapbox.map('map', 'moasth.map-b8gu63cc', {minZoom: 5, maxZoom: 15, maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]]});
map.setView( [48.58476,7.65], 13, true);
$(".leaflet-control-zoom").remove();