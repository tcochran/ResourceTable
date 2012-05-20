class AddForeignKeysToBook < ActiveRecord::Migration
  def change
    change_table :books do |t|
      t.remove :author
      t.remove :subject
      t.remove :language
      t.references :author
      t.references :subject
      t.references :language

    end
  end
end
