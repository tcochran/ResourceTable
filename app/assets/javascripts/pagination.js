if (typeof ResourceTable === 'undefined') {
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
};