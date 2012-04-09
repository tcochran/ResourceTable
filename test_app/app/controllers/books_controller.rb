class BooksController < ApplicationController
	def index
		@books = Book.all
		
    results = {data: @books, page: 2, total: @books.size, page_size: 10 }

    respond_to do |format|
      format.html 
      format.json { render json: results }
    end
	end
end
