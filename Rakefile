#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

TestApp::Application.load_tasks

require 'nokogiri'
require 'open-uri'

desc "load catalog"
task :load_catalog => :environment do

	Book.destroy_all
	Author.destroy_all
	Subject.destroy_all
	Language.destroy_all
	doc = Nokogiri::XML(File.open("test/catalog.rdf"))

	r = Random.new
	doc.xpath("//pgterms:etext")[0, 1000].each do |book_node|
		name = content_or_blank(book_node.at_xpath(".//dc:title"))
		author_name = content_or_blank(book_node.at_xpath(".//dc:creator"))
		subject_name =  content_or_blank(book_node.at_xpath(".//dc:subject//rdf:value"))
		language_name =  content_or_blank(book_node.at_xpath(".//dc:language"))

		next if (author_name.nil? || subject_name.nil? || language_name.nil? || name.nil? )

		author = Author.find_or_create_by_name(author_name)
		subject = Subject.find_or_create_by_name(subject_name)
		language = Language.find_or_create_by_name(language_name)

		Book.create!(:name => name, :author => author, :subject => subject, :language => language, :quantity => r.rand(1...100))
	end
end

task :publish => :environment do 

	files = ["resourcetable.js","pagination.js", "datasource.js", "statestorage.js", "currentstate.js", "jquery.resourcetable.js"]
	command = "cat "
	command += files.map {|file_name| "app/assets/javascripts/#{file_name}"}.join(" ")
	command += "  > ../lib/resourcetable.js"

	system command
	system "java -jar lib/yuicompressor-2.4.7.jar ../lib/resourcetable.js -o ../lib/resourcetable.min.js"

end

def content_or_blank node
	return nil if node.nil?
	node.content.strip
end
