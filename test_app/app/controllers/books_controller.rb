class BooksController < ApplicationController

  PageSize = 2
	def index


    respond_to do |format|
      format.html do 
        @authors = Book.find(:all, :select => "author", :group => "author").map(&:author)
      end
      format.json do 
        conditions = params[:filter]
        page = (params[:page] || 1).to_i
        offset = (page - 1) * PageSize
        order = "#{params[:sort] || "name"} #{params[:sort_direction] || "asc"}"


        @books = Book.all(:limit => PageSize, :offset => offset, :order => order, :conditions => conditions)
        
        results = {data: @books, page: page, total: Book.count, page_size: PageSize }

        render json: results 
      end
    end
	end
end
