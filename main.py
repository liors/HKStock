from flask import Flask, render_template, url_for, redirect, request
import os
from pymongo import MongoClient, Connection
from random import randrange
from urlparse import urlparse
import json
from bson import json_util
import urllib2

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

app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/')
def main():    
	count  = db.products.find({ 'img' : { '$exists' : True }}).count()
	data = []
	data.append(db.products.find({ 'img' : { '$exists' : True }}).skip(randrange( 1, count )).limit(-1).next())
	data.append(db.products.find({ 'img' : { '$exists' : True }}).skip(randrange( 1, count )).limit(-1).next())
	data.append(db.products.find({ 'img' : { '$exists' : True }}).skip(randrange( 1, count )).limit(-1).next())
	return render_template('index.html', data = data)

@app.route('/products')
def products_page():
	return redirect(url_for('products', page_id=1))

@app.route('/me')
def user_page():
	return render_template('user.html')

@app.route('/products/p/<int:page_id>')
def products(page_id):
	if page_id < 1:
		page_id = 1   
	page_start = 8 * (page_id - 1) 
	page_end = 8 * page_id	
	if page_id < 5:
		pages = [1, 2, 3, 4, 5]
	else:
		pages = [page_id-2, page_id-1, page_id, page_id+1, page_id+2]
	return render_template('products.html', page = page_id, pages = pages, data = db.products.find({ 'img' : { '$exists' : True }})[page_start:page_end])

@app.route('/product/<int:product_id>')
def product(product_id):
	product = db.products.find_one({'id' : product_id})
	return render_template('product.html', product=product)

@app.route('/productInfo/<int:product_id>')
def productPrice(product_id):
	api = "http://www.hobbyking.com/hobbyking_api.asp?id=" + str(product_id) + "+&switch=3"	
	price = "$" + urllib2.urlopen(api).read();
	api = "http://www.hobbyking.com/hobbyking_api.asp?id=" + str(product_id) + "+&switch=1"	
	stock = urllib2.urlopen(api).read();
	return toJson({"price" : price, "stock" : stock})

@app.route('/search/<query>')	
def search(query):
	results = db.products.find({'img' : { '$exists' : True }, 'description' : {"$regex": query, "$options" : "-i" }})[:]
	return toJson(fromMongoToAPI(results))

@app.route('/get')	
def getProduct():
	product_ids = request.args.get('ids').split(',')
	results = db.products.find({ 'id' : { "$in": map(int, product_ids)}})[:]
	return toJson(fromMongoToAPI(results))

@app.route('/user/<int:user_id>')
def getUserData(user_id):
    user = db.users.find_one({'id' : user_id})
    if user is None:
        db.users.save({ 'id' : user_id})
        user = db.users.find_one({'id' : user_id})
        json_results = dict()
        json_results['products'] = products
        return toJson(json_results)
    json_results = dict()
    if user[u'products'] is not None:
        product_ids = user[u'products'].split(',')
        data = db.products.find({ 'id' : { "$in": map(int, product_ids)}})[:]
        json_results['user'] = user
        products = []
        for result in data:
            obj = {}
            obj['description'] = result[u'description']
            obj['id'] = result[u'id']
            obj['img'] = result[u'img']
            products.append(obj)
        json_results['products'] = products
    else:
        json_results['user'] = user
    return toJson(json_results)

@app.route('/user/<int:user_id>', methods=['POST'])
def saveUserProducts(user_id):
    result = db.users.update({ 'id' : user_id}, { '$set': { 'products': json.loads(request.data)['products'] }}, True)
    return toJson({"status" : "ok"})

def fromMongoToAPI(data):
	json_results = []
	for result in data:
		obj = {}
		obj['description'] = result[u'description']
		obj['id'] = result[u'id']
		obj['img'] = result[u'img']
		json_results.append(obj)
	return json_results
	
def toJson(data):
	return json.dumps(data, default=json_util.default)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
	app.run()

