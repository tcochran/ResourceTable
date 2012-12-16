if (typeof ResourceTable === 'undefined') {
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



