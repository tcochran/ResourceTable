ResourceTable = {}
ResourceTable.FilterTemplate = "filter[{{ key }}]";


_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};


ResourceTable.Loader = function(url, renderDataCallBack, renderPaginationCallBack){
  var self = this;
  this.url = new ResourceTable.Url(url, window.location.href);
  this.renderDataCallBack = renderDataCallBack;
  this.renderPaginationCallBack = renderPaginationCallBack;
  this.pagination = new ResourceTable.Pagination();
  this.filterTemplate = _.template(ResourceTable.FilterTemplate);
  
  ResourceTable.Loader.listenToAnchorChangedEvents(function(){
    self.url = new ResourceTable.Url(url, window.location.href);
    self.load();
  });
  
};

ResourceTable.Loader.prototype.sort = function(key, direction) { 
    this.url.change_hash({sort:key, sort_direction: direction});
}

ResourceTable.Loader.prototype.filter = function(filterHash) { 
  var filterHashWithPrefix = {};
  var self = this;
  _.each(filterHash, function(value, key) {
    filterHashWithPrefix[self.filterTemplate({key: key})] = value;
  });

  this.url.change_hash(filterHashWithPrefix);
}

ResourceTable.Loader.prototype.change_page = function(page_num) { 
    this.url.change_hash({page: page_num});
}

ResourceTable.Loader.prototype.load = function() {
  var self = this;

  $.getJSON(this.url.hash_to_url(), null, function(result){ 
    self.renderDataCallBack(result.data);
    var paginationResults = self.pagination.generate(result);
    self.renderPaginationCallBack(paginationResults);
  });
};

//Not sure this can be tested easily with jasmine, perhaps selenium
ResourceTable.Loader.listenToAnchorChangedEvents = function(callBack) {
  var self = this;

  if ("onhashchanged" in window) { 
    window.onhashchange = function () {
      callBack();
    }
  }
  else { 
      var storedHash = window.location.hash;
      window.setInterval(function () {
        if (window.location.hash != storedHash) {
          storedHash = window.location.hash;
          callBack();
        }
      }, 100);
  }
};

ResourceTable.Pagination = function() {
  this.numOfLinks = 2;
};

ResourceTable.Pagination.prototype._calculatefirstAndLastPage = function(results) {
  var numPages = Math.ceil(results.total / results.page_size);

  var firstPage = results.page - this.numOfLinks;
  var lastPage = results.page + this.numOfLinks;

  if (lastPage > numPages) {
    lastPage = numPages;
    firstPage = lastPage - (2 * this.numOfLinks);
  }

  if (firstPage < 1) {
    lastPage =  1 + (this.numOfLinks * 2);
    if (lastPage > numPages) {
      lastPage = numPages;
    }
    firstPage = 1;
  }

  return [firstPage, lastPage];
};

ResourceTable.Pagination.prototype.generate = function(results) {  

  var previousLink = {name: "Previous", link: results.page - 1, disabled: results.page == 1};
  var links = [previousLink];

  var firstAndLastTuple = this._calculatefirstAndLastPage(results);

  _.chain(_.range(firstAndLastTuple[0], (firstAndLastTuple[1] + 1))).each(function(page_num){
    links.push({name: page_num.toString(), link: page_num, disabled: page_num == results.page});
  });

  var isOnLastPage = firstAndLastTuple[1] == results.page;
  var nextLink = {name: "Next", link: results.page + 1, disabled: isOnLastPage};

  links.push(nextLink);

  return links;
};



ResourceTable.Url = function(base_url, full_url) { 
  this.base_url = base_url;
  this.query = this.parse_hash(full_url);
}

ResourceTable.Url.prototype.parse_hash = function(url) {
  var matches = url.match(/([&#])([^#&=]+)=?([^&#]+)/g);
  var queryHash = { };
  _.each(matches, function(query){ 
    var match = /^[&#](.+)=(.+)$/.exec(query);
    if (match != null)
      queryHash[match[1]] = match[2];
  });
  return queryHash;
};

ResourceTable.Url.prototype.change_hash = function(new_hash) {
  var self = this;
 _.each(new_hash, function(value, key) { self.query[key] = value; });
  ResourceTable.Navigation.change_hash(this.hash_to_query());
};

ResourceTable.Url.prototype.hash_to_query = function() { 
  return _.map(this.query, function(value, key){ return key + "=" + value; }).join("&");
};

ResourceTable.Url.prototype.hash_to_url = function() { 
  var url = this.base_url + "?";
  url += this.hash_to_query();
  return url;
};

ResourceTable.Navigation = {}
ResourceTable.Navigation.change_hash = function (hash) {
  window.location.hash = hash;
};
