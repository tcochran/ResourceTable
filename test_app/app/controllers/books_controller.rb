class BooksController < ApplicationController

  PageSize = 100
	def index


    respond_to do |format|
      format.html do 
        @authors = Book.find(:all, :select => "author", :group => "author", ).map(&:author)
        @subjects = Book.find(:all, :select => "subject", :group => "subject").map(&:subject)
      end
      format.json do 
        conditions = params[:filter]
        page = (params[:page] || 1).to_i
        offset = (page - 1) * PageSize
        sort_direction = params[:sort_direction] == "descending" ? "DESC" : "ASC";
        order = "#{params[:sort] || "name"} #{sort_direction}"


        @books = Book.all(:limit => PageSize, :offset => offset, :order => order, :conditions => conditions)
        
        results = {data: @books, page: page, total: Book.count(:conditions => conditions), page_size: PageSize }

        render json: results 
      end
    end
	end
end
