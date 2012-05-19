class CreateBooks < ActiveRecord::Migration
  def change
    create_table :books do |t|
      t.string :name
      t.string :author
      t.string :subject
      t.string :language
      t.integer :quantity
      t.timestamps
    end
  end
end
