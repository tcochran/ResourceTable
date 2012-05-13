// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

// jquery widget

(function( $ ) {
  $.widget("ui.resourceTable", {
    
    options: { 
      url: "",
      renderDataCallBack: function(data){},
      paginationElement: $({}),
      sortElements: $({})
    },

    _create: function() {
      var self = this;
      this.table = new ResourceTable.Loader(this.options.url, this.options.renderDataCallBack, function(paginationSummary, sort) { self._renderView(paginationSummary, sort) });
      this.table.load();

      self.options.sortElements.click(function(){
        self._toggleSort($(this));
        return false;
      });
    },

    sort: function(name, direction) {
      this.table.sort(name, direction);
    },

    filter: function(filter) {
      this.table.filter(filter);
    }, 

    _toggleSort: function(element)
    {
      var self = this;
      if (element.hasClass("sort-ascending")) {
        var sortDirection = "descending";
      } else {          
        var sortDirection = "ascending";
      }
      
      self.sort(element.attr("name"), sortDirection);
    },

    _renderView: function(paginationSummary, sort) {
      var self = this;
      self._renderPagination(paginationSummary)
      self._renderSort(sort);
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
    },

    _renderSort: function(sort) {
      if (sort.key == undefined)
        return;
      this.options.sortElements.toggleClass("sort-ascending sort-descending", false);
      //TODO - refactor this line
      var sortElement =  _.find(this.options.sortElements, function(elem) { return $(elem).is("[name='" + sort.key + "']")});
      $(sortElement).addClass("sort-" + sort.direction); 
    }
  });

}( jQuery ) );