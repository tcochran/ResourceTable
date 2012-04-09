describe("ResourceTable data ", function(){

  it("Should load json data from url", function(){
    var resourceTable = new ResourceTable.Loader(null, "some url", function() { } );
    spyOn(jQuery, "getJSON")
    resourceTable.load()

    expect(jQuery.getJSON).toHaveBeenCalledWith("some url", null, jasmine.any(Function));
  });

  it("should render rows via callback", function(){
    var stubCallBack = jasmine.createSpy();
    var resourceTable = new ResourceTable.Loader("element", "some url", stubCallBack);
    
    spyOn(jQuery, "getJSON").andCallFake(function(value, data, callBack) { callBack([1, 2]); });
    resourceTable.load();

    expect(stubCallBack.calls[0].args).toEqual(["element", 1])
    expect(stubCallBack.calls[1].args).toEqual(["element", 2])
  
  });

});

describe("ResourceTable pagination", function(){
  it("should generate disabled previous link when on first page", function() {
    results = { total: 100, page_size: 10, page: 1, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links[0]).toEqual({name: "Previous", disabled: true, link: 0 });
  });

  it("should generate enabled previous link not on first page", function() {
    results = { total: 100, page_size: 10, page: 3, data: [] }

    var pagination = new ResourceTable.Pagination();
    var links = pagination.generate(results);

    expect(links[0]).toEqual({name: "Previous", disabled: false, link: 2 });
  });
  

});