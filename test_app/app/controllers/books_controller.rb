class BooksController < ApplicationController

  PageSize = 2
	def index
    page = (params[:page] || 1).to_i
    offset = (page - 1) * PageSize
    order = "#{params[:sort] || "name"} #{params[:sort_direction] || "asc"}"
		@books = Book.all(:limit => PageSize, :offset => offset, :order => order)
		
    results = {data: @books, page: page, total: Book.count, page_size: PageSize }

    respond_to do |format|
      format.html 
      format.json { render json: results }
    end
	end
end
