class Book < ActiveRecord::Base
  attr_accessible :author, :name, :language, :quantity, :subject

  belongs_to :author
  belongs_to :language
  belongs_to :subject

  def as_json(options={})
    super(:include =>[:author, :language, :subject])
  end
end
