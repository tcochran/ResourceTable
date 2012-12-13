// ResourceTable.js 0.1.0
// (c) Timothy Cochran 2012
// https://github.com/tcochran/Resource-Table

// jquery widget

(function ($) {
    $.widget("ui.resourceTable", {
        options: {
            url: "",
            renderDataCallBack: function (data) { },
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
            this.table = new ResourceTable.Loader(this.options.url, this.options.renderDataCallBack,
                function (currentState) {
                     self._renderView(currentState);
                },
                this.filters.currentState(),
                this.options.defaultSort,
                
                this.options.beforeDataLoad,
                this.options.afterDataLoad,

                this.options.failureCallBack, 
                ResourceTable.StateMethods[this.options.stateMethod]);

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
                    link.click(function () { self.table.change_page(paginationLink.link); return false; });
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

    //ToDo: Lav/Sam. Added Blur to make tab out work for IE8. If there is a better solution then we need to change this.
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