from flask import Flask, render_template, url_for
import os
from pymongo import MongoClient, Connection
from random import randrange

# configuration
DATABASE = '/tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

MONGO_URL = os.environ.get('MONGOHQ_URL')
 
if MONGO_URL:
  # Get a connection
  connection = Connection(MONGO_URL)
  # Get the database
  db = connection[urlparse(MONGO_URL).path[1:]]
else:
  # Not on an app with the MongoHQ add-on, do some localhost action
  client = MongoClient()
  db = client.video_database

app = Flask(__name__)
app.config.from_object(__name__)


collection = db.test

@app.route('/')
def main():    
	count  = collection.find({ 'img' : { '$exists' : True }}).count()
	offset = randrange( 1, count )
	data = collection.find({ 'img' : { '$exists' : True }}).skip(offset).limit(3)
	return render_template('index.html', data = data)

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

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
	app.run()

