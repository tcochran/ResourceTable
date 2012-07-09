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
            sortElements: $({})
        },

        _create: function () {
            var self = this;
            this.filters = new ResourceTableView.Filters(self.options.filterElements, self);

            this.table = new ResourceTable.Loader(this.options.url, this.options.renderDataCallBack, function (currentState) { self._renderView(currentState) }, this.filters.currentState());
            this.table.load();

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
        },

        _toggleSort: function (element) {
            var self = this;
            if (element.hasClass("sort-ascending")) {
                var sortDirection = "descending";
            } else {
                var sortDirection = "ascending";
            }

            self.sort(element.attr("name"), sortDirection);
        },

        _renderView: function (currentState) {
            var self = this;
            self._renderPagination(currentState.paginationSummary)
            self._renderSort(currentState.sort);
            self._renderFilters(currentState.filter);
        },

        _renderPagination: function (paginationSummary) {
            var self = this;
            var paginationElement = this.options.paginationElement;
            paginationElement.empty();
            _.each(paginationSummary, function (paginationLink) {
                if (!paginationLink.disabled) {
                    var link = $("<a>", { href: "" }).html(paginationLink.name)
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
            this.options.sortElements.toggleClass("sort-ascending sort-descending", false);
            //TODO - refactor this line
            var sortElement = _.find(this.options.sortElements, function (elem) { return $(elem).is("[name='" + sort.key + "']") });
            $(sortElement).addClass("sort-" + sort.direction);
        },

        _renderFilters: function (filter) {
            this.filters.setFilterValues(filter);

        }



    });

} (jQuery));



ResourceTableView = {};
ResourceTableView.Filters = function () { }
ResourceTableView.Filters = function (elements, resourceTable) {
    var self = this;
    self.element = elements;

    self.filters = {};
    _.each(elements, function (element) {
        var element = $(element);
        var key = element.attr("name");

        if (element.is("select")) {
            self.filters[key] = new ResourceTableView.SelectFilter(key, element, resourceTable);
        }
    });
}

ResourceTableView.Filters.prototype.setFilterValues = function (filterValues) {
    var self = this;
    _.each(filterValues, function (value, key) {
        self.filters[key].setValue(value);
    });
};

ResourceTableView.Filters.prototype.currentState = function () {
    var self = this;
    var currentState = {};
    console.log("here");
    _.each(self.filters, function (filter, key) {
        console.log(filter, key);
        currentState[key] = filter.getValue();
    });
    console.log(currentState);
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