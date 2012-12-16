// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

if (typeof ResourceTable === 'undefined') {
    ResourceTable = {}
} 

ResourceTable.FilterTemplate = "filter[<%= key %>]";

ResourceTable.StateStorageMethods =
{
    hash: function() { return new ResourceTable.HashUrlStateStorage(); },
    memory: function() { return new ResourceTable.MemoryStateStorage(); }
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
    this.changeState({ sort: { key: key, direction: direction }})
};

ResourceTable.Loader.prototype.filter = function (filterHash) {
    
    this.changeState({filter: filterHash})
};

ResourceTable.Loader.prototype.changeState = function(new_state)
{   
    var self = this;
    updatedState = {};
    _.each(new_state, function(values, key) {
        var clonedValues = _.clone(self.state.currentState[key]);
        _.extend(clonedValues, values);        
        updatedState[key] = clonedValues;       
    });

    this.state.change(updatedState);   
}

ResourceTable.Loader.prototype.currentState = function() {
    return this.state.currentState;
};

ResourceTable.Loader.prototype.changePage = function (page_num) {
    this.state.change({ page: page_num });
};

ResourceTable.Loader.prototype.load = function () {
    var self = this;    
    var newState = {};

    if (!self.state.currentState.hasFilter() && !_.isEmpty(self.options.defaultFilter)) {
        newState.filter = self.options.defaultFilter;
    }

    if (!self.state.currentState.hasSort() && !_.isEmpty(this.options.defaultSort)) {
        newState.sort = self.options.defaultSort;
    }

    if (!_.isEmpty(newState))
    {
        self.changeState(newState);
        return;
    }

    self.options.beforeDataLoad(self.state.currentState);

    self.datasource.load(this.state, function (result, currentState) {
        currentState.paginationSummary = self.pagination.generate(result);
        self.options.onLoad(result, currentState);
        self.options.afterDataLoad(currentState);
    });
};