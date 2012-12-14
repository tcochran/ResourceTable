// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

if (typeof ResourceTable === 'undefined') {
    ResourceTable = {}
} 

ResourceTable.FilterTemplate = "filter[<%= key %>]";

ResourceTable.StateMethods =
{
    hash: function() { return new ResourceTable.HashUrlState(); },
    memory: function() { return new ResourceTable.MemoryState(); }
};

ResourceTable.Loader = function (options) {
    var self = this;

    var defaults = {
        beforeDataLoad: function() {},
        onDataLoad: function() {},
        afterDataLoad: function() {},
        onError: function() {},
        
        defaultFilter: {},
        defaultSort: {}
    };

    
    self.options = _.extend(defaults, options);
    self.state = self.options.stateMethod();
    self.pagination = new ResourceTable.Pagination();
    self.datasource = ResourceTable.DataSource.JqueryAjax(self.options.baseUrl);

    self.state.onChange(function () {
        self.load();
    });
};

ResourceTable.Loader.prototype.sort = function (key, direction) {
    this.state.change({ sort: { key: key, direction: direction }});
};

ResourceTable.Loader.prototype.filter = function (filterHash) {
    var filterHashWithPrefix = {};
    var self = this;

    var filter = _.clone(self.state.currentState.filter)
    _.extend(filter, filterHash);

    self.state.change({filter: filter});
};

ResourceTable.Loader.prototype.currentState = function() {
    return this.state.currentState;
};

ResourceTable.Loader.prototype.changePage = function (page_num) {
    this.state.change({ page: page_num });
};

ResourceTable.Loader.prototype.load = function () {
    var self = this;    

    // TODO: Refactor defaults
    if (!self.state.hasFilter() && !_.isEmpty(self.defaultFilter)) {
        self.filter(self.options.defaultFilter);
        return;
    }

    if (!this.state.hasSort() && !_.isEmpty(this.defaultSort)) {
        self.sort(self.options.defaultSort.key, self.options.defaultSort.direction);
        return;
    }

    self.options.beforeDataLoad(self.state.currentState);

    self.datasource.load(this.state, function (result, currentState) {
        currentState.paginationSummary = self.pagination.generate(result);
        self.options.onLoad(result, currentState);
        self.options.afterDataLoad(currentState);
    });
};