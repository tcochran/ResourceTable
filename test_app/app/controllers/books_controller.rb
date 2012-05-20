class BooksController < ApplicationController

  PageSize = 20
	def index


    respond_to do |format|
      format.html do 
        @authors = Author.find(:all, :order => "name ASC").map {|author| [author.name[0, 30], author.id]  }
        @subjects = Subject.find(:all, :order => "name ASC").map {|subject| [subject.name[0, 30], subject.id]  }
        @languages = Language.find(:all, :order => "name ASC").map {|language| [language.name[0, 30], language.id]  }
      end
      format.json do 
        conditions = params[:filter]
        page = (params[:page] || 1).to_i
        offset = (page - 1) * PageSize
        sort_direction = params[:sort_direction] == "descending" ? "DESC" : "ASC";
        order = "#{params[:sort] || "name"} #{sort_direction}"


        @books = Book.includes(:author, :language, :subject).all(:limit => PageSize, :offset => offset, :order => order, :conditions => conditions, :include => [])
        
        results = {data: @books, page: page, total: Book.count(:conditions => conditions), page_size: PageSize }

        render json: results 
      end
    end
	end
end
