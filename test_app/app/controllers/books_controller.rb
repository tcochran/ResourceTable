class BooksController < ApplicationController

  PageSize = 2
	def index
    page = (params[:page] || 1).to_i
    p params
    offset = (page - 1) * PageSize
		@books = Book.all(:limit => PageSize, :offset => offset)
		
    results = {data: @books, page: page, total: Book.count, page_size: PageSize }

    respond_to do |format|
      format.html 
      format.json { render json: results }
    end
	end
end
