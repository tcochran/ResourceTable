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
        var val = filter.getValue();
        if (val != null && val != "")
            currentState[key] = filter.getValue();
    });
    console.log(currentState);
    return currentState;
};

ResourceTableView.SelectFilter = function (key, element, resourceTable) {
    var self = this;
    this.element = element;
    this.resourceTable = resourceTable;

    element.change(function () {
        var filter = {};
        var val = self.getValue();
        filter[key] = val;
        resourceTable.filter(filter);
    });
};

ResourceTableView.SelectFilter.prototype.setValue = function (value) {
    var values = value == "" ? [] : value.split(",")

    this.element.val(values);
};

ResourceTableView.SelectFilter.prototype.getValue = function () {
    var val = this.element.val();

    if (val == null)
        return "";
    if (typeof(val) == "string")
        return val;

    
    return val.join(",")
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