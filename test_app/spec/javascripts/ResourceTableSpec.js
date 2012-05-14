describe("ResourceTable loader ", function(){

  it("Should load json data from url", function(){
    var resourceTable = new ResourceTable.Loader("some url", function() { } );
    resourceTable.pagination = jasmine.createSpy();
    spyOn(jQuery, "getJSON");
    resourceTable.load()

    expect(jQuery.getJSON).toHaveBeenCalledWith("some url?", null, jasmine.any(Function));
  });

  it("Should generate pagination links", function(){
    var stubViewCallBack = jasmine.createSpy();
    var resourceTable = new ResourceTable.Loader("some url", function() { }, stubViewCallBack);
    spyOn(resourceTable.pagination, "generate").andReturn("something")
    spyOn(jQuery, "getJSON").andCallFake(function(value, data, callBack) { callBack([1, 2]); });

    resourceTable.load();
    expect(resourceTable.pagination.generate).toHaveBeenCalledWith([1, 2])  
    expect(stubViewCallBack.calls[0].args[0].paginationSummary).toEqual("something");
  });

  it("should render rows via callback", function(){
    var stubCallBack = jasmine.createSpy();
    var resourceTable = new ResourceTable.Loader("some url", stubCallBack, function(){});
    spyOn(resourceTable.pagination, "generate")
    
    spyOn(jQuery, "getJSON").andCallFake(function(value, data, callBack) { callBack({data: [1, 2]}); });
    resourceTable.load();

    expect(stubCallBack.calls[0].args).toEqual([[1, 2]])
  });

});

describe("ResourceTable pagination", function(){
  it("should generate disabled previous link when on first page", function() {
    results = { total: 100, page_size: 10, page: 1, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links[0]).toEqual({name: "Previous", disabled: true, link: 0 });
  });

  it("should generate enabled previous link when not on first page", function() {
    results = { total: 100, page_size: 10, page: 3, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links[0]).toEqual({name: "Previous", disabled: false, link: 2 });
  }); 

  it("should generate disabled next link when on last page", function() {
    results = { total: 101, page_size: 10, page: 11, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(_.last(links)).toEqual({name: "Next", disabled: true, link: 12 });
  });

  it("should generate enabled next link when not on last page", function() {
    results = { total: 101, page_size: 10, page: 10, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(_.last(links)).toEqual({name: "Next", disabled: false, link: 11 });
  }); 

  it("should generate links to first 5 pages links with first disabled", function(){
    results = { total: 100, page_size: 10, page: 1, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links.length).toEqual(7)

    expect(links[1]).toEqual({name: "1", disabled: true, link: 1 });
    expect(links[2]).toEqual({name: "2", disabled: false, link: 2 });
    expect(links[3]).toEqual({name: "3", disabled: false, link: 3 });
    expect(links[4]).toEqual({name: "4", disabled: false, link: 4 });
    expect(links[5]).toEqual({name: "5", disabled: false, link: 5 });

  });

  it("should generate 2 links either side of currently selected page", function(){
    results = { total: 100, page_size: 10, page: 4, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links.length).toEqual(7)

    expect(links[1]).toEqual({name: "2", disabled: false, link: 2 });
    expect(links[2]).toEqual({name: "3", disabled: false, link: 3 });
    expect(links[3]).toEqual({name: "4", disabled: true, link: 4 });
    expect(links[4]).toEqual({name: "5", disabled: false, link: 5 });
    expect(links[5]).toEqual({name: "6", disabled: false, link: 6 });

  });

  it("should generate links either side of currently selected page if within range", function(){
    results = { total: 100, page_size: 10, page: 2, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links[1]).toEqual({name: "1", disabled: false, link: 1 });
    expect(links[2]).toEqual({name: "2", disabled: true, link: 2 });
    expect(links[3]).toEqual({name: "3", disabled: false, link: 3 });
    expect(links[4]).toEqual({name: "4", disabled: false, link: 4 });
    expect(links[5]).toEqual({name: "5", disabled: false, link: 5 });
  });

  it("display last link if on last page", function(){
    results = { total: 100, page_size: 10, page: 10, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links[5]).toEqual({name: "10", disabled: true, link: 10 });

  });

});

describe("ResourceTable url", function () {
  it ("should parse url to get give query string key value pairs", function(){
    var url = "http://some_url#page=1&sort=name&direction=asc";
    var rtUrl = new ResourceTable.Url("", url)

    expect(rtUrl.query.page).toBe("1");
    expect(rtUrl.query.sort).toBe("name");
    expect(rtUrl.query.direction).toBe("asc");
  });

  it ("should convert hash code url to query string", function(){
    var url = "http://some_url#page=1&sort=name&direction=asc";
    var rtUrl = new ResourceTable.Url("http://some_url", url);
    var queryUrl = rtUrl.hash_to_url();
    expect(queryUrl).toBe("http://some_url?page=1&sort=name&direction=asc")

  });

});

describe ("ResourceTable sorting", function(){
  it ("should sort", function(){

    var stubCallBack = jasmine.createSpy();
    var resourceTable = new ResourceTable.Loader("some url", stubCallBack, $({}));
    spyOn(resourceTable.pagination, "generate");
    
    spyOn(ResourceTable.Navigation, "change_hash");
    resourceTable.sort("name", "asc");

    expect(ResourceTable.Navigation.change_hash).toHaveBeenCalledWith("sort=name&sort_direction=asc");

  });
});

describe ("ResourceTable filtering", function(){
  it ("should filter", function(){

    var stubCallBack = jasmine.createSpy();
    var resourceTable = new ResourceTable.Loader("some url", stubCallBack, $({}));
    spyOn(resourceTable.pagination, "generate");
    
    spyOn(ResourceTable.Navigation, "change_hash");
    resourceTable.filter({ "name": "book_name", "author": "tim" });

    expect(ResourceTable.Navigation.change_hash).toHaveBeenCalledWith("filter[name]=book_name&filter[author]=tim");

  });
});

describe ("ResourceTable Url parsing", function(){
  it ("should parse state from url using rails style filters", function(){
    var urlHash = {
      page: 1,
      sort: "name",
      sort_direction: "ascending",
      "filter[name]": "book name",
      "filter[author]": "tim"
    }

    var tableState = ResourceTable.ParseUrlRailsStyle(urlHash);

    expect(tableState.page).toBe(1);
    expect(tableState.sort).toEqual({ key: "name", direction: "ascending"});
    expect(tableState.filter).toEqual({ name: "book name", author: "tim"});

  });

})