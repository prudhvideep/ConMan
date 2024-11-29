from pymongo import MongoClient
from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from urllib.request import urlopen
import json
from sentence_transformers import SentenceTransformer
from flask_cors import CORS
import yaml

model = SentenceTransformer("all-MiniLM-L6-v2")

DB_NAME = "project"
COLLECTION_NAME = "user"
INDEX_NAME = "books"

class AtlasClient:

    def __init__(self, altas_uri, dbname):
        self.mongodb_client = MongoClient(altas_uri)
        self.database = self.mongodb_client[dbname]

    # A quick way to test if we can connect to Atlas instance
    def ping(self):
        self.mongodb_client.admin.command("ping")

    # Get the MongoDB Atlas collection to connect to
    def get_collection(self, collection_name):
        collection = self.database[collection_name]
        return collection

    # Query a MongoDB collection
    def find(self, collection_name, filter={}, limit=0):
        collection = self.database[collection_name]
        items = list(collection.find(filter=filter, limit=limit))
        return items
    
    def insert(self, collection_name, user_info):
        collection = self.database[collection_name]
        result = collection.insert_one(user_info)
        return result

    def delete(self, collection_name, user_id):
        collection = self.database[collection_name]
        result = collection.delete_one(user_id)
        return result
    
    def update(self, collection_name, user_id, new_value):
        collection = self.database[collection_name]
        result = collection.update_one(user_id, new_value)
        return result

app = Flask(__name__)
CORS(app)

def pretty_response(response):
    outputs = []
    if len(response["hits"]["hits"]) == 0:
        return("Your search returned no results.")
    else:
        for hit in response["hits"]["hits"]:
            output = {
                "id": hit["_id"],
                "score": hit["_score"],
                "title": hit["_source"]["title"],
                "date": hit["_source"]["publication_date"],
                "publisher": hit["_source"]["publisher"],
                "edition": hit["_source"]["edition"],
                "search_times": hit["_source"]["search_times"],
                "author": hit["_source"]["author"],
                "isbn": hit["_source"]["ISBN-13"],
                "genre": hit["_source"]["genre"],
                "summary": hit["_source"]["summary"]
            }
            outputs.append(output)
    return outputs

def search_time_increase(response):
    if response=="Your search returned no results.":
        return 0
    for resp in response:
        update_body = {
            "script": {
                "source": "ctx._source.search_times += 1",
                "lang": "painless"
            }
        }
        result = client.update(index=INDEX_NAME, id=resp["id"], body=update_body)
        # print(result)

# Create account
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if 'username' not in data:
        return jsonify({"message": "Please enter username"}), 400
    if 'email' not in data:
        return jsonify({"message": "Please enter email"}), 400
    username = data['username']
    email = data['email']
    if username or email:
        return jsonify({"message": "Please enter valid username or email"}), 400
    user_info = {
        "username": username,
        "email": email,
        "search_history":[],
        "read_books":[]
    }
    if atlas_client.find(collection_name=COLLECTION_NAME, filter={"email": email}):
        return jsonify({"message": "Email already exists"}), 400

    resp = atlas_client.insert(collection_name=COLLECTION_NAME, user_info=user_info)
    return jsonify({"message": f"User registered successfully, id: {resp.inserted_id}"}), 200

# Delete account
@app.route('/delete', methods=['POST'])
def delete():
    data = request.json
    email = data['email']

    if not atlas_client.find(collection_name=COLLECTION_NAME, filter={"email": email}):
        return jsonify({"message": "Email do not exist"}), 400

    resp = atlas_client.delete(collection_name=COLLECTION_NAME, user_id={"email": email})
    return jsonify({"message": f"User deleted successfully. See you again"}), 200

# User search history update
@app.route("/searched", methods=['POST'])
def search_history_update():
    data = request.json
    if 'search' not in data:
        return jsonify({"message": "Please enter search history"}), 400
    if 'email' not in data:
        return jsonify({"message": "Please enter email"}), 400
    email = data['email']
    query = data['search']
    if len(query) < 1 or type(query) is not list:
        return jsonify({"message": "Invalid search history."}), 400
    update = {
        "$push": {
            "search_history": {
                "$each": query
            }
        }
    }
    resp = atlas_client.update(collection_name=COLLECTION_NAME, user_id={"email": email},new_value=update)
    return jsonify({"message": "User search history updated"}), 200
    # return 0

# User search history update
@app.route("/read", methods=['POST'])
def read_books_update():
    data = request.json
    email = data['email']
    query = data['read']
    update = {
        "$push": {
            "read_books": {
                "$each": query
            }
        }
    }
    resp = atlas_client.update(collection_name=COLLECTION_NAME, user_id={"email": email},new_value=update)
    return jsonify({"message": "User read books updated"}), 200
    # return 0

# Elastic Search Info
@app.route("/elasticsearch")
def elastic_info():
    try:
        info = client.info()
        print("Connected to Elasticsearch:", info)
    except Exception as e:
        print("Error connecting to Elasticsearch:", e)
    return f"{info}"

# Search by summary
@app.route("/elasticsearch/summary")
def search():
    query = request.args.get("query") 
    response = client.search(
        index=INDEX_NAME,
        knn={
            "field": "summary_vector",
            "query_vector": model.encode(query),
            "k": 10,
            "num_candidates": 100,
        },
    )
    search_time_increase(pretty_response(response))
    # return 
    return jsonify({"message": f"Requetst success", "data": pretty_response(response)}), 203

# Filter by condition
@app.route("/elasticsearch/filter", methods=['GET'])
def filter():
    author = request.args.get("author") 
    title = request.args.get("title") 
    genre = request.args.get("genre") 
    isbn = request.args.get("isbn") 
    publisher = request.args.get("publisher")
    edition = request.args.get("edition") 


    filter = []
    if author:
        filter.append({"match": {"author": author}})
    if isbn:
        filter.append({"term": {"ISBN-13": isbn}})
    if title:
        filter.append({"match_phrase": {"title": title}})
    if publisher:
        filter.append({"term": {"publisher": publisher}})
    if edition:
        filter.append({"term": {"edition": edition}})
    if genre:
        filter.append({"term": {"genre": genre}})

    query = {
        "query": {
            "bool":{
                "filter": filter
                # "must":must
            }
        }
    }
    response = client.search(index=INDEX_NAME, body=query)
    search_time_increase(pretty_response(response))
    return jsonify({"message": f"Get data successfully", "data": pretty_response(response)}), 200

# Popular search
@app.route("/elasticsearch/popular", methods=['GET'])
def popular():
    order = request.args.get("order")
    if order!="asc" and order!="desc":
        order = "desc"
    query = {
        "query": {
            "match_all": {}
        },
        "sort": [
            {
                "search_times": {
                    "order": order
                }
            }
        ]
    }
    response = client.search(index=INDEX_NAME, body=query)
    # search_time_increase(pretty_response(response))
    return jsonify({"message": f"Get data successfully", "data": pretty_response(response)}), 200

# Personalized Recommendations
@app.route("/elasticsearch/customize", methods=['POST'])
def customize():
    data = request.json
    email = data['email']
    if 'email' not in data:
        return jsonify({"message": "Please enter email"}), 400
    # Get user search history
    user = atlas_client.find(collection_name=COLLECTION_NAME, filter={"email": email})
    search_history = user[0]["search_history"]
    read_books = user[0]["read_books"]
    if len(search_history) < 1:
        query = {
            "query": {
                "match_all": {}
            },
            "sort": [
                {
                    "search_times": {
                        "order": "desc"
                    }
                }
            ]
        }
        response = client.search(index=INDEX_NAME, body=query)
        return jsonify({"message": f"Get data successfully", "data": pretty_response(response)}), 200
    response = client.search(
        index=INDEX_NAME,
        body={
            "query": {
                "bool": {
                    "must": {
                        "knn": {
                            "field": "book_vector",
                            "query_vector": model.encode(search_history).mean(axis=0),
                            "k": 10,
                            "num_candidates":100,
                        }
                    },
                    "must_not": {
                        "terms": {
                            "_id": read_books
                        }
                    }
                }
            }
        }
    )
    return jsonify({"message": f"Requetst success", "data": pretty_response(response)}), 200

# Insert books
@app.route("/elasticsearch/insert", methods=['POST'])
def insert():
    books = request.json
    operations = []
    for book in books:
        if 'title' not in book:
            return jsonify({"message": "Please enter title"}), 400
        if 'author' not in book:
            return jsonify({"message": "Please enter author"}), 400
        if 'genre' not in book:
            return jsonify({"message": "Please enter genre"}), 400
        if 'summary' not in book:
            return jsonify({"message": "Please enter summary"}), 400
        genre = book['genre']
        title = book['title']
        summary = book['summary']
        if not genre or not title or not summary:
            return jsonify({"message": "Book lack essential information"}), 400
        operations.append({"index": {"_index": INDEX_NAME}})
        book["summary_vector"] = model.encode(book["summary"]).tolist()
        book["book_vector"] = model.encode(book["author"]+[genre]+[title]+[summary]).mean(axis=0).tolist()
        operations.append(book)
    result = client.bulk(index=INDEX_NAME, operations=operations, refresh=True)
    if result.body['errors'] == False:
        print("No error in inserting books")
        return jsonify({"message": "Successfully inserted"}), 200
    else:
        print(result)
        return jsonify({"message": "Errors when inserting"}), 400

if __name__ == "__main__":
    with open("config.yaml", "r", encoding="utf-8") as file:
        config = yaml.safe_load(file)
    cloud_id = config["cloud_id"] 
    api_key = config["api_key"] 
    url = config["mongodb_url"] 
    data_url = config["data_url"]
    port = config["port"] 

    atlas_client = AtlasClient(url, DB_NAME)
    collection = atlas_client.get_collection(COLLECTION_NAME)
    app.secret_key = "CSE-512-GROUP-PROJECT-2024"

    client = Elasticsearch(
        cloud_id=cloud_id,
        api_key=api_key
    )

    # if client.indices.exists(index=INDEX_NAME):
        # client.indices.delete(index=INDEX_NAME)
    if not client.indices.exists(index=INDEX_NAME):
        mappings = {
            "properties": {
                "title": {
                    "type": "text",
                },
                "genre": {
                    "type": "keyword",
                }, 
                "summary_vector": {
                    "type": "dense_vector",
                    "dims": 384,
                },
                "ISBN_13": {
                    "type": "keyword",
                },
                "publisher": {
                    "type": "keyword",
                },
                "publication_date": {
                    "type": "date",
                    "format": "yyyy-MM-dd||yyyy-M-d||epoch_millis"
                },
                "edition":{
                    "type": "integer",
                },
                "search_times": {
                    "type": "integer",
                },
                "book_vector":{
                    "type": "dense_vector",
                    "dims": 384,
                },
            }
        }
        response = urlopen(data_url)
        books = json.loads(response.read())
        operations = []
        client.indices.create(index=INDEX_NAME, mappings=mappings)
        for book in books:
            operations.append({"index": {"_index": INDEX_NAME}})
            book["summary_vector"] = model.encode(book["summary"]).tolist()
            book["book_vector"] = model.encode(book["author"]+[book["genre"]]+[book["title"]]+[book["summary"]]).mean(axis=0).tolist()
            operations.append(book)
        result = client.bulk(index=INDEX_NAME, operations=operations, refresh=True)
        # count = client.count(index=INDEX_NAME)
        if result.body['errors'] == False:
            print("No error in creating index")
        else:
            print(result)

    app.run(host="0.0.0.0",port=port)
    # app.run(port=8000)