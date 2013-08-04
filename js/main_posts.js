/ Display png logo when svg isn't supported (thank you @walterstephanie)
if(!Modernizr.svg) {
	var imgs = $('img[data-fallback]');
	imgs.attr('src', imgs.data('fallback'));
}


// Scrollbar
function refreshScrollBar(){
	$(".posts-container").niceScroll({cursorborder: "none", cursorwidth: "8px", cursorborderradius:0, cursoropacitymin:0.25 , cursorcolor:"#24A6E8"});
};
// Pose problème avec le fixed top sur Chrome...
//$(".leaflet-map-pane").removeAttr("style")

// Load map
var map = L.mapbox.map('map', 'moasth.map-b8gu63cc', {minZoom: 5, maxZoom: 15, maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]]});
map.setView( [48.58476,7.65], 13, true);
$(".leaflet-control-container").remove();

disqus_config = function() {
  this.callbacks.onReady.push(function() { console.log('DISQUS onReady'); refreshScrollBar();});
  this.callbacks.onNewComment.push(function() { console.log('DISQUS onNewComment'); refreshScrollBar();});
  /* Available callbacks are afterRender, onInit, onNewComment, onPaginate, onReady, preData, preInit, preReset */
}

refreshScrollBar();