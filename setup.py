import urllib2
import pymongo
from pymongo import MongoClient
from bs4 import BeautifulSoup

class HKSetup(object):

    def __init__(self):
    	self.db = MongoClient().video_database

    def importImages(self):
        for obj in self.db.test.find({ 'img' : { '$exists' : False }}):
        	print obj["id"]
        	url = "http://www.hobbyking.com/hobbyking/store/uh_viewitem.asp?idproduct=" + str(obj["id"])
     		try:
        		output = urllib2.urlopen(url).read()
        		soup = BeautifulSoup(output, 'html5lib')
        		image = soup.find(id="mainpic1")
        		image.get("src")
        		self.db.test.update({"_id":obj['_id']}, {"$set": { "img" : image.get("src") }}, updsert=False)
     		except:
        		print 'bad markup'