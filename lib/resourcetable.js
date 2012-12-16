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
    if (!self.state.currentState.hasFilter() && !_.isEmpty(self.defaultFilter)) {
        self.filter(self.options.defaultFilter);
        return;
    }

    if (!this.state.currentState.hasSort() && !_.isEmpty(this.defaultSort)) {
        self.sort(self.options.defaultSort.key, self.options.defaultSort.direction);
        return;
    }

    self.options.beforeDataLoad(self.state.currentState);

    self.datasource.load(this.state, function (result, currentState) {
        currentState.paginationSummary = self.pagination.generate(result);
        self.options.onLoad(result, currentState);
        self.options.afterDataLoad(currentState);
    });
};if (typeof ResourceTable === 'undefined') {
    ResourceTable = {};
} 

ResourceTable.Pagination = function () {
    this.numOfLinks = 2;
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
};if (typeof ResourceTable === 'undefined') {
    ResourceTable = {};
} 

ResourceTable.Url = {};

ResourceTable.Url.hash_to_query = function (state) {

	var query = {};
    _.each(state.filter, function (value, key) {
        query[_.template(ResourceTable.FilterTemplate)({ key: key })] = value;
    });
    if (state.page !== undefined) {	
    	query.page = state.page;
    }

    if (state.sort !== undefined && state.sort.key !== undefined) {
    	query.sort = state.sort.key;
    	query.sort_direction = state.sort.direction;
	}
    return _.map(query, function (value, key) { return key + "=" + value; }).join("&");
};

ResourceTable.Url.hash_to_url = function (base_url, state) {
    var appender = /\?/.test(base_url) ? '&' : '?';
    var url = base_url + appender;
    return url + ResourceTable.Url.hash_to_query(state.currentState);
};

ResourceTable.DataSource = {};

ResourceTable.DataSource.JqueryAjax = function(base_url) {

	var load = function(state, onload, onerror) {
		var url = ResourceTable.Url.hash_to_url(base_url, state);
		$.ajax({
	        url: url,
	        cache: false,
	        async: true,
	        dataType: "json",
	        success: function (data) {
	        	state.currentState.url = url;
	        	state.currentState.page = data.page;
	        	onload(data, state.currentState);
	        },
	        error: function (jqXHR, textStatus, errorThrown) {
	        	onerror(textStatus + " - " + errorThrown);
	        }
	    });
	};

	return {
		load: load
	};
};


ResourceTable.DataSource.Json = function(data) {
	var load = function(state, onload, onerror) {	
		onload(data);
	};

	return {
		load: load
	};
};

if (typeof ResourceTable === 'undefined') {
    ResourceTable = {};
} 

ResourceTable.Navigation = { };
ResourceTable.Navigation.change_hash = function (hash) {
    window.location.hash = hash;
};


ResourceTable.HashUrlStateStorage = function () {
    this.refresh();
};

ResourceTable.HashUrlStateStorage.prototype.refresh = function () {
    var currentUrl = window.location.href;
    this.currentState = this.parse_hash(currentUrl);
};

ResourceTable.HashUrlStateStorage.prototype.parse_hash = function (url) {
    var matches = url.match(/([&#])([^#&=]+)=?([^&#]+)/g) || [];
    var queryHash = {};
    _.each(matches, function (query) {
        var match = /^[&#](.+)=(.+)$/.exec(query);
        if (match != null)
            queryHash[match[1]] = match[2];
    });
    this.filterSize = _.filter(matches, function(s) { return s.indexOf !== -1 }).length;
    return this.parseUrlDotNetStyle(queryHash);
};

ResourceTable.HashUrlStateStorage.prototype.parseUrlDotNetStyle = function (urlHash) {
    var filter = {};
    _.each(urlHash, function (value, key) {
        var match = key.match(/^filter\[(\w+)\]$/);
        if (match != null) {
            filter[match[1]] = value;
        }
    });

    var currentState = new ResourceTable.CurrentState()

    _.extend(currentState, {
        page: urlHash.page,
        sort: { key: urlHash.sort, direction: urlHash.sort_direction },
        filter: filter
    });
    return currentState;
};


ResourceTable.HashUrlStateStorage.prototype.change = function (new_hash) {
    _.extend(this.currentState, new_hash);
    ResourceTable.Navigation.change_hash(ResourceTable.Url.hash_to_query(this.currentState));
};

ResourceTable.HashUrlStateStorage.prototype.onChange = function (callBack) {
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


ResourceTable.MemoryStateStorage = function () {
    this.currentState = new ResourceTable.CurrentState();
};

ResourceTable.MemoryStateStorage.prototype.onChange = function (callBack) {
    this.onChangeCallback = callBack;
};

ResourceTable.MemoryStateStorage.prototype.change = function (new_hash) {
    this.query = _.extend(this.currentState, new_hash);
    this.onChangeCallback();
};

ResourceTable.MemoryStateStorage.prototype.refresh = function () {};if (typeof ResourceTable === 'undefined') {
    ResourceTable = {};
}

ResourceTable.CurrentState = function() {
	var self = this;
	self.sort = {};
	self.filters = {}; 


	self.hasFilter = function () {
	    return !_.isEmpty(self.filter);
	};

	self.hasSort = function () {
	    return !_.isEmpty(self.sort);
	};

	return self;
};



(function ($) {
    $.widget("ui.resourceTable", {
        options: {
            url: "",
            renderDataCallBack: function (data, currentState) { },
            paginationElement: $({}),
            sortElements: $({}),
            filterChanged: function (filter) { },
            failureBackBack: function (failure) { },
            stateMethod: "hash",
            defaultSort: {}
        },

        _create: function () {
            var self = this;

            this.filters = new ResourceTableView.Filters(self.options.filterElements, self);

            var resourceTableOptions = {
                baseUrl: self.options.url,

                beforeLoad: self.options.beforeDataLoad,
                onLoad: function(data, currentState) {
                    self._renderView(currentState);
                    self.options.renderDataCallBack(data, currentState);
                },
                afterLoad: self.options.afterDataLoad,
                defaultSort: self.options.defaultSort,
                defaultFilter: self.filters.currentState(),
                stateMethod: ResourceTable.StateStorageMethods[self.options.stateMethod]
            };

            self.table = new ResourceTable.Loader(resourceTableOptions);

            self._renderFilters(this.table.currentState().filter);
            self.options.sortElements.click(function () {
                self._toggleSort($(this));
                return false;
            });
        },

        sort: function (name, direction) {
            this.table.sort(name, direction);
        },

        filter: function (filter) {
            this.table.filter(filter);
            this.options.filterChanged(filter);
        },
        
        load: function () {
            this.table.load();
        },

        _toggleSort: function (element) {
            var sortDirection = element.hasClass("sort-ascending")  ? "descending" : "ascending";

            this.sort(element.attr("name") || element.data("name"), sortDirection);
        },

        _renderView: function (currentState) {
            var self = this;
            self._renderPagination(currentState.paginationSummary);
            self._renderSort(currentState.sort);
            self._renderFilters(currentState.filter);
        },

        _renderPagination: function (paginationSummary) {
            var self = this;
            var paginationElement = this.options.paginationElement;
            paginationElement.empty();
            _.each(paginationSummary, function (paginationLink) {
                if (!paginationLink.disabled) {
                    var link = $("<a>", { href: "" }).html(paginationLink.name);
                    paginationElement.append(link);
                    link.click(function () { self.table.changePage(paginationLink.link); return false; });
                } else {
                    paginationElement.append($("<span>").html(paginationLink.name));
                }
            });
        },

        _renderSort: function (sort) {
            if (sort.key == undefined)
                return;
            
            this.options.sortElements.removeClass("sort-ascending sort-descending");
            
            //TODO - refactor this line
            var sortElement = _.find(this.options.sortElements, function (elem) { return $(elem).is("[name='" + sort.key + "']") || $(elem).data('name') == sort.key; });
            $(sortElement).addClass("sort-" + sort.direction);
        },

        _renderFilters: function (filter) {
            this.filters.setFilterValues(filter);
        }
    });
} (jQuery));

ResourceTableView = {};
ResourceTableView.Filters = function () { }
ResourceTableView.Filters = function(elements, resourceTable) {
    var self = this;
    self.element = elements;

    self.filters = { };
    _.each(elements, function(element) {
        var element = $(element);
        var key = element.attr("name");

        if (element.is("select")) {
            self.filters[key] = new ResourceTableView.SelectFilter(key, element, resourceTable);
        } else if (element.is(".date-picker")) {
            self.filters[key] = new ResourceTableView.DatePickerFilter(key, element, resourceTable);
        } else if (element.is("input[type='radio']")) {
            self.filters[key] = new ResourceTableView.RadioButtonFilter(key, element, resourceTable);
        }
    });
};

ResourceTableView.Filters.prototype.setFilterValues = function (filterValues) {
    var self = this;

    _.each(filterValues, function (value, key) {
        if (self.filters[key])
            self.filters[key].setValue(value);
    });
};

ResourceTableView.Filters.prototype.currentState = function () {
    var self = this;
    var currentState = {};
    _.each(self.filters, function (filter, key) {
        currentState[key] = filter.getValue();
    });
    return currentState;
};

ResourceTableView.SelectFilter = function (key, element, resourceTable) {
    this.element = element;
    this.resourceTable = resourceTable;

    element.change(function () {
        var filter = {};
        filter[key] = element.val();
        
        resourceTable.filter(filter);
    });
};

ResourceTableView.SelectFilter.prototype.setValue = function (value) {
    this.element.val(value);
};

ResourceTableView.SelectFilter.prototype.getValue = function () {
    return this.element.val();
};

ResourceTableView.DatePickerFilter = function (key, element, resourceTable) {
    this.element = element;
    this.resourceTable = resourceTable;

    var filterTable = function () {
        var filter = {};
        filter[key] = element.val();
        resourceTable.filter(filter);

    };
    element.change(filterTable).blur(filterTable);
};

ResourceTableView.DatePickerFilter.prototype.setValue = function (value) {
    this.element.datepicker("setDate", value);
    this.element.attr("value", value);
};

ResourceTableView.DatePickerFilter.prototype.getValue = function () {
    return this.element.val();
};


ResourceTableView.RadioButtonFilter = function (key, element, resourceTable) {
    this.element = element;
    this.resourceTable = resourceTable;

    element.change(function () {
        var filter = {};
        var radioButton = $.grep(element, function(elem) { return $(elem).is(":checked"); });
        filter[key] = $(radioButton).val();
        resourceTable.filter(filter);
    });
};

ResourceTableView.RadioButtonFilter.prototype.setValue = function (value) {
    var radioButton = $.grep(this.element, function(element) { return $(element).val()==value; });
    $(radioButton).attr('checked', true);
};

ResourceTableView.RadioButtonFilter.prototype.getValue = function () {
    var radioButton = $.grep(this.element, function (element) { return $(element).is(":checked"); });
    return $(radioButton).val();
};