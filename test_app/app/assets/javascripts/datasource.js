if (typeof ResourceTable === 'undefined') {
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
    url += ResourceTable.Url.hash_to_query(state.currentState);
    return url;
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

