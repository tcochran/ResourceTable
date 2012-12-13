if (typeof ResourceTable === 'undefined') {
    ResourceTable = {}
} 

ResourceTable.FilterTemplate = "filter[<%= key %>]";

ResourceTable.StateMethods =
{
    hash: function() { return new ResourceTable.HashUrlState(); },
    memory: function() { return new ResourceTable.MemoryState(); }
};

ResourceTable.Loader = function (baseUrl, renderDataCallBack, renderViewCallBack, defaultFilter, defaultSort, beforeDataLoad, afterDataLoad, failureCallBack, stateMethod) {
    var self = this;

    this.state = stateMethod();

    this.renderDataCallBack = renderDataCallBack;
    this.renderViewCallBack = renderViewCallBack;
    this.beforeDataLoad = beforeDataLoad || function () { };
    this.afterDataLoad = afterDataLoad || function () { };
    this.pagination = new ResourceTable.Pagination();
    this.filterTemplate = _.template(ResourceTable.FilterTemplate);
    this.defaultFilter = defaultFilter || {};
    this.failureCallBack = failureCallBack || function () { };

    this.defaultSort = defaultSort || {};

    this.state.onChange(function () {
        self.load();
    });

    self.datasource = ResourceTable.DataSource.JqueryAjax(new ResourceTable.Url(baseUrl));
};

ResourceTable.Loader.prototype.sort = function (key, direction) {
    this.state.change({ sort: key, sort_direction: direction });
};

ResourceTable.Loader.prototype.filter = function (filterHash) {
    var filterHashWithPrefix = {};
    var self = this;
    _.each(filterHash, function (value, key) {
        filterHashWithPrefix[self.filterTemplate({ key: key })] = value;
    });

    this.state.change(filterHashWithPrefix);
};

ResourceTable.Loader.prototype.currentState = function() {
    return this.state.currentState;
};

ResourceTable.Loader.prototype.change_page = function (page_num) {
    this.state.change({ page: page_num });
};

ResourceTable.Loader.prototype.load = function () {
    var self = this;
    
    
    if (!this.state.hasFilter() && !_.isEmpty(this.defaultFilter)) {
        this.filter(this.defaultFilter);

        return;
    }
    if (!this.state.hasSort() && !_.isEmpty(this.defaultSort)) {
        this.sort(this.defaultSort.key, this.defaultSort.direction);
        return;
    }

    self.beforeDataLoad();

    self.datasource.load(this.state, function (result) {
        var currentState = self.state.currentState;
        currentState.paginationSummary = self.pagination.generate(result);
        self.renderViewCallBack(self.state.currentState);
        self.renderDataCallBack(result, "", self.state.currentState);
        self.afterDataLoad();
    });
};


ResourceTable.Navigation = { };
ResourceTable.Navigation.change_hash = function (hash) {
    window.location.hash = hash;
};

ResourceTable.HashUrlState = function () {
    this.refresh();
};

ResourceTable.HashUrlState.prototype.refresh = function () {
    var currentUrl = window.location.href;
    this.query = this.parse_hash(currentUrl);
};

ResourceTable.HashUrlState.prototype.parse_hash = function (url) {
    var matches = url.match(/([&#])([^#&=]+)=?([^&#]+)/g) || [];
    var queryHash = {};
    _.each(matches, function (query) {
        var match = /^[&#](.+)=(.+)$/.exec(query);
        if (match != null)
            queryHash[match[1]] = match[2];
    });
    this.filterSize = _.filter(matches, function(s) { return s.indexOf !== -1 }).length;
    this.currentState = this.parseUrlDotNetStyle(queryHash);

    return queryHash;
};

ResourceTable.HashUrlState.prototype.parseUrlDotNetStyle = function (urlHash) {

    var filter = {};
    _.each(urlHash, function (value, key) {
        var match = key.match(/^filter\[(\w+)\]$/);
        if (match != null) {
            filter[match[1]] = value;
        }
    });

    var currentState = {
        page: urlHash.page,
        sort: { key: urlHash.sort, direction: urlHash.sort_direction },
        filter: filter
    };
    return currentState;
};


ResourceTable.HashUrlState.prototype.change = function (new_hash) {
    var self = this;
    _.each(new_hash, function (value, key) { self.query[key] = value; });
    ResourceTable.Navigation.change_hash(ResourceTable.Url.hash_to_query(this));
};

ResourceTable.HashUrlState.prototype.hasFilter = function () {
    
    return this.filterSize > 0;
};

ResourceTable.HashUrlState.prototype.hasSort = function () {
    return !_.isEmpty(this.query.sort);
};

//Not sure this can be tested easily with jasmine, perhaps selenium
ResourceTable.HashUrlState.prototype.onChange = function (callBack) {
    var self = this;

    if ("onhashchange" in window) {
        window.onhashchange = function () {
            self.refresh();
            callBack();
        };
    }
    else {
        var storedHash = window.location.hash;
        window.setInterval(function () {
            if (window.location.hash != storedHash) {
                storedHash = window.location.hash;
                self.refresh();
                callBack();
            }
        }, 100);
    }
};


ResourceTable.MemoryState = function () {
    this.query = { };
    this.currentState = { sort: {}, filter: {}};
};

ResourceTable.MemoryState.prototype.hasFilter = function () {
    return !_.isEmpty(this.query);
};

ResourceTable.MemoryState.prototype.hasSort = function () {
    return !_.isEmpty(this.query.sort);
};

ResourceTable.MemoryState.prototype.onChange = function (callBack) {
    this.onChangeCallback = callBack;
};

ResourceTable.MemoryState.prototype.change = function (new_hash) {
    this.query = _.extend(this.query, new_hash);
    this.onChangeCallback();
};

ResourceTable.MemoryState.prototype.refresh = function () {
};

ResourceTable.Pagination = function () {
    this.numOfLinks = 1;
};

ResourceTable.Pagination.prototype._calculatefirstAndLastPage = function (results) {
    var numPages = Math.ceil(results.total / results.page_size);

    var firstPage = results.page - this.numOfLinks;
    var lastPage = results.page + this.numOfLinks;

    if (lastPage > numPages) {
        lastPage = numPages;
        firstPage = lastPage - (2 * this.numOfLinks);
    }

    if (firstPage < 1) {
        lastPage = 1 + (this.numOfLinks * 2);
        if (lastPage > numPages) {
            lastPage = numPages;
        }
        firstPage = 1;
    }

    return [firstPage, lastPage];
};

ResourceTable.Pagination.prototype.generate = function (results) {

    var previousLink = { name: "Previous", link: results.page - 1, disabled: results.page == 1 };
    var links = [previousLink];

    var firstAndLastTuple = this._calculatefirstAndLastPage(results);

    if (firstAndLastTuple[0] > 1) {

        links.push({ name: "1", link: 1, disabled: false });
        if (firstAndLastTuple[0] > 2) {
            links.push({ name: "...", link: "", disabled: true });
        }
    }
    _.chain(_.range(firstAndLastTuple[0], (firstAndLastTuple[1] + 1))).each(function (page_num) {
        links.push({ name: page_num.toString(), link: page_num, disabled: page_num == results.page });
    });

    var isOnLastPage = firstAndLastTuple[1] == results.page;
    var numPages = Math.ceil(results.total / results.page_size);

    if (results.page != numPages && (firstAndLastTuple[1] < numPages)) {
        if ((firstAndLastTuple[1] + 1) < numPages) {
            links.push({ name: "...", link: "", disabled: true });
        }

        links.push({ name: numPages.toString(), link: numPages, disabled: false });
    }
    var nextLink = { name: "Next", link: results.page + 1, disabled: isOnLastPage };

    links.push(nextLink);

    return links;
};

