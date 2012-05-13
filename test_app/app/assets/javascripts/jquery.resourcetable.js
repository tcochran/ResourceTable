// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

// jquery widget

(function( $ ) {
  $.widget("ui.resourceTable", {
    
    options: { 
      url: "",
      renderDataCallBack: function(data){},
      paginationElement: $({})
    },

    _create: function() {
      var self = this;
      this.table = new ResourceTable.Loader(this.options.url, this.options.renderDataCallBack, function(paginationSummary) { self._renderPagination(paginationSummary) });
      this.table.load();
    },

    sort: function(name, direction) {
      this.table.sort(name, direction);
    },

    filter: function(filter) {
      this.table.filter(filter);
    }, 

    _renderPagination: function(paginationSummary) {
      var self = this;
      var paginationElement = this.options.paginationElement;
      paginationElement.empty();
      _.each(paginationSummary, function(paginationLink){
        if (!paginationLink.disabled) {
          var link = $("<a>", {href: ""}).html(paginationLink.name)
          paginationElement.append(link);
          link.click(function() { self.table.change_page(paginationLink.link); return false; });
        } else {
          paginationElement.append($("<span>").html(paginationLink.name));
        }
      });
    }



  });

}( jQuery ) );