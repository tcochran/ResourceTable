// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

// jquery widget

(function( $ ) {
  $.widget("ui.resourceTable", {
    
    options: { 
      url: "",
      renderRowCallBack: function(element, row){},
      paginationElement: $({})
    },

    _create: function() {
     this.table = new ResourceTable.Loader(this.element, this.options.url, this.options.renderRowCallBack, this.options.paginationElement);
     this.table.load();
    }

  });

}( jQuery ) );


// Resource Table class

ResourceTable = {}

ResourceTable.Loader = function(element, url, renderRowCallBack, pagination_element){
  this.url = url;
  this.renderRowCallBack = renderRowCallBack;
  this.element = element;
  this.pagination = new ResourceTable.Pagination();
  this.pagination_element = pagination_element;
};

ResourceTable.Loader.prototype.load = function() {
  var self = this;
  $.getJSON(this.url, null, function(result){
    _.each(result.data, function(row) { self.renderRowCallBack(self.element, row);})
    var paginationResults = self.pagination.generate(result);
    ResourceTable.PaginationLinks.render(self.pagination_element, paginationResults, self.url);
  });
};

ResourceTable.Pagination = function() {
  this.numOfLinks = 2;
};

ResourceTable.Pagination.prototype.calculatefirstAndLastPage = function(results) {
  var numPages = Math.ceil(results.total / results.page_size);

  var firstPage = results.page - this.numOfLinks;
  var lastPage = results.page + this.numOfLinks;

  if (lastPage > numPages) {
    lastPage = numPages;
    firstPage = lastPage - (2 * this.numOfLinks);
  }
  
  if (firstPage < 1) {
    lastPage =  1 + (numPages * 2);
    if (lastPage > numPages) {
      lastPage = numPages;
    }
    firstPage = 1;
  }
  return [firstPage, lastPage];
};

ResourceTable.Pagination.prototype.generate = function(results) {  
  var previousLink = {name: "Previous", link: results.page - 1, disabled: false}
  if (results.page == 1) { previousLink.disabled = true; }
  var links = [previousLink];

  var firstAndLastTuple = this.calculatefirstAndLastPage(results);
  _.chain(_.range(firstAndLastTuple[0], (firstAndLastTuple[1] + 1))).each(function(page_num){
    links.push({name: page_num.toString(), link: page_num, disabled: page_num == results.page})
  });

  var nextLink = {name: "Next", link: results.page + 1, disabled: false}  
  var isOnLastPage = firstAndLastTuple[1] == results.page 
  if (isOnLastPage) { nextLink.disabled = true; }

  links.push(nextLink);

  return links;
};

ResourceTable.PaginationLinks = {}
ResourceTable.PaginationLinks.render = function(element, pagination_summary, base_url) {
  _.each(pagination_summary, function(pagination_link){
    if (!pagination_link.disabled) {
      element.append($("<a>", { href: base_url + "?page=" + pagination_link.link }).html(pagination_link.name));
    } else {

      element.append($("<span>").html(pagination_link.name));
    }
  });
}

