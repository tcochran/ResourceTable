describe("ResourceTable data ", function(){

  it("Should load json data from url", function(){
    var resourceTable = new ResourceTable.Loader("some url", function() { } );
    resourceTable.pagination = jasmine.createSpy();
    spyOn(jQuery, "getJSON");
    resourceTable.load()

    expect(jQuery.getJSON).toHaveBeenCalledWith("some url?", null, jasmine.any(Function));
  });

  it("Should generate pagination links", function(){
    var resourceTable = new ResourceTable.Loader("some url", function() { }, $({}) );
    spyOn(resourceTable.pagination, "generate")
    spyOn(jQuery, "getJSON").andCallFake(function(value, data, callBack) { callBack([1, 2]); });

    resourceTable.load();
    expect(resourceTable.pagination.generate).toHaveBeenCalledWith([1, 2])
  
  });

  it("should render rows via callback", function(){
    var stubCallBack = jasmine.createSpy();
    var resourceTable = new ResourceTable.Loader("some url", stubCallBack, $({}));
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

describe("ResourceTable pagination render", function(){ 
  it("should render enabled links as a tags", function(){
    var element = $("<div>");
    var summary = [{name: "test link", link: 1, disabled: false } ]
    ResourceTable.PaginationLinks.render(element, summary, "some_url");
  
    expect(element.children().size()).toBe(1);
    expect(element.find("> a:first").html()).toBe("test link");
  }); 


  it("should render disabled links as spans", function(){
    var element = $("<div>");
    var summary = [{name: "test span", link: 1, disabled: true } ]
    ResourceTable.PaginationLinks.render(element, summary, "some_url");
  
    expect(element.children().size()).toBe(1);
    expect(element.find("> span:first").html()).toBe("test span");
  }); 

  it("should add page query to url", function(){
    var element = $("<div>");
    var summary = [{name: "", link: 1, disabled: false } ]
    ResourceTable.PaginationLinks.render(element, summary, "some_url");
  
    expect(element.find("> a:first").attr("href")).toBe("some_url#page=1");
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
    var queryUrl = rtUrl.hash_to_query();
    expect(queryUrl).toBe("http://some_url?page=1&sort=name&direction=asc")

  });

});