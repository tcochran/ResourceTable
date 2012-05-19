class Book < ActiveRecord::Base
  attr_accessible :author, :name, :language, :quantity, :subject
end
