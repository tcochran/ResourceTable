// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

// jquery widget

(function( $ ) {
  $.widget("ui.resourceTable", {
    
    options: { 
      url: "",
      renderRowCallBack: function(element, row){},
    },

    _create: function() {
     this.table = new ResourceTable.Loader(this.element, this.options.url, this.options.renderRowCallBack);
     this.table.load();
    }

  });

}( jQuery ) );


// Resource Table class

ResourceTable = {}

ResourceTable.Loader = function(element, url, renderRowCallBack){
  this.url = url;
  this.renderRowCallBack = renderRowCallBack;
  this.element = element;
};

ResourceTable.Loader.prototype.load = function() {
  var self = this;
  $.getJSON(this.url, null, function(result){
    _.each(result, function(here) { self.renderRowCallBack(self.element, here);})
  });
};

ResourceTable.Pagination = function() {};

ResourceTable.Pagination.prototype.generate = function(results) {
  var links = [];
  var previousLink = {name: "Previous", link: results.page - 1, disabled: false}

  if (results.page == 1)
  {
    previousLink.disabled = true;
  } 

  return [previousLink];
};
