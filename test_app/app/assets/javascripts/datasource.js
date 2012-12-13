
if (typeof ResourceTable === 'undefined') {
    ResourceTable = {}
} 

ResourceTable.Url = function(base_url) {
    this.base_url = base_url;
};

ResourceTable.Url.hash_to_query = function (state) {
    return _.map(state.query, function (value, key) { return key + "=" + value; }).join("&");
};

ResourceTable.Url.hash_to_url = function (base_url, state) {
    var appender = /\?/.test(base_url) ? '&' : '?';
    var url = base_url + appender;
    url += ResourceTable.Url.hash_to_query(state);
    return url;
};

ResourceTable.DataSource = {}

ResourceTable.DataSource.JqueryAjax = function(base_url) {

	var load = function(state, onload, onerror) {
		var url = ResourceTable.Url.hash_to_url(base_url.base_url, state);

		$.ajax({
	        url: url,
	        cache: false,
	        async: true,
	        dataType: "json",
	        success: function (data) {
	        	onload(data);
	        },
	        error: function (jqXHR, textStatus, errorThrown) {
	            //self.failureCallBack(textStatus, errorThrown);
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

