if (typeof ResourceTable === 'undefined') {
    ResourceTable = {};
}

ResourceTable.CurrentState = function() {
	var self = this;
	self.sort = {};
	self.filter = {}; 


	self.hasFilter = function () {
	    return !_.isEmpty(self.filter);
	};

	self.hasSort = function () {
	    return !_.isEmpty(self.sort) && self.sort.key !== undefined;
	};

	return self;
};



