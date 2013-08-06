// Display png logo when svg isn't supported (thank you @walterstephanie)
if(!Modernizr.svg) {
	var imgs = $('img[data-fallback]');
	imgs.attr('src', imgs.data('fallback'));
}

// Scrollbar
function createScrollBar(){
	$("#js-page").niceScroll({cursorborder: "none", cursorwidth: "8px", cursorborderradius:0, cursoropacitymin:0.25 , cursorcolor:"#24A6E8"});
};

function refreshScrollBar(){
	$("#js-page").getNiceScroll().resize();
};

// Load map
var map = L.mapbox.map('map', 'moasth.map-b8gu63cc', {minZoom: 5, maxZoom: 15, maxBounds: [[41.275605,-13.64502],[52.534491,19.665527]]});
map.setView( [48.58476,7.65], 13, true);
$(".leaflet-control-container").remove();

disqus_config = function() {
  /*this.callbacks.afterRender.push(function() { console.log('DISQUS afterRender'); refreshScrollBar();});
  this.callbacks.onNewComment.push(function() { console.log('DISQUS onNewComment'); refreshScrollBar();});
  this.callbacks.onPaginate.push(function() { console.log('DISQUS onPaginate'); refreshScrollBar();});*/
  /* Available callbacks are afterRender, onInit, onNewComment, onPaginate, onReady, preData, preInit, preReset */
	/*this.callbacks.afterRender = [refreshScrollBar()];
  	this.callbacks.onNewComment = [refreshScrollBar()];
  	this.callbacks.onPaginate = [refreshScrollBar()];
*/
  	this.callbacks.onNewComment = [function() { refreshScrollBar(); }];
  	this.callbacks.onReady = [function() { refreshScrollBar(); }];
  	
}

//createScrollBar();
