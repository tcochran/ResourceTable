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

ResourceTable.MemoryStateStorage.prototype.refresh = function () {};