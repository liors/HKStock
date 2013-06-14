from flask import Flask, render_template, url_for
import os
from pymongo import MongoClient, Connection
from random import randrange
from urlparse import urlparse
import json
from bson import json_util

# configuration
DEBUG = True
MONGO_URL = os.environ.get('MONGOHQ_URL')
 
if MONGO_URL:
	print MONGO_URL
  	# Get a connection
  	connection = Connection(MONGO_URL)
  	# Get the database
  	db = connection[urlparse(MONGO_URL).path[1:]]
else:
  	# Not on an app with the MongoHQ add-on, do some localhost action
  	print 'Not on an app with the MongoHQ add-on, do some localhost action'
  	client = MongoClient()
  	db = client.video_database

collection = db.test

app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/')
def main():    
	count  = collection.find({ 'img' : { '$exists' : True }}).count()
	data = []
	data.append(collection.find({ 'img' : { '$exists' : True }}).skip(randrange( 1, count )).limit(-1).next())
	data.append(collection.find({ 'img' : { '$exists' : True }}).skip(randrange( 1, count )).limit(-1).next())
	data.append(collection.find({ 'img' : { '$exists' : True }}).skip(randrange( 1, count )).limit(-1).next())
	return render_template('index.html', data = data)

@app.route('/products')
def products_page():
	return render_template('products.html', page = 1, data = collection.find()[1:10])

@app.route('/products/p/<int:page_id>')
def products(page_id):
	if page_id < 1:
		page_id = 1   
	page_start = 10 * (page_id - 1) 
	page_end = 10 * page_id	
	return render_template('products.html', page = page_id, data = collection.find()[page_start:page_end])

@app.route('/product/<int:product_id>')
def product(product_id):
	return render_template('product.html', product = collection.find_one({'id' : product_id}))

@app.route('/search/<query>')	
def search(query):
	results = collection.find({ 'description' : {"$regex": query}})
	return toJson(fromMongoToAPI(results))

def fromMongoToAPI(data):
	json_results = []
	for result in data:
		obj = {}
		obj['description'] = result[u'description']
		obj['id'] = result[u'id']
		json_results.append(obj)
	return json_results
	
def toJson(data):
	return json.dumps(data, default=json_util.default)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
	app.run()

