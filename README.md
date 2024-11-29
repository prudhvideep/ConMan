# ConMan Project Documentation

## Table of Contents

* [1. Overview](#1-overview)
* [2. Modules](#2-modules)
    * [2.1. MongoDB Interaction Module (`mongo.py`)](#21-mongodb-interaction-module-mongopy)
    * [2.2. Elasticsearch Interaction Module](#22-elasticsearch-interaction-module)
    * [2.3. User Authentication Module](#23-user-authentication-module)
    * [2.4. Search Module](#24-search-module)
    * [2.5. Recommendation Module](#25-recommendation-module)
    * [2.6. Frontend Module](#26-frontend-module)

* [3. Key Functions and Usage](#3-key-functions-and-usage)
* [4. Deployment](#4-deployment)


## 1. Overview

ConMan is a book search and recommendation application built using a combination of MongoDB, Elasticsearch, and a React frontend.  The application allows users to create accounts, search for books using semantic search and faceted filtering, and receive personalized book recommendations based on their search history and reading activity.  The backend is implemented using Python with Flask, utilizing the pymongo, elasticsearch, and sentence-transformers libraries. The frontend uses React with Tailwind CSS for styling.

## 2. Modules

### 2.1. MongoDB Interaction Module (`mongo.py`)

This module handles all interactions with the MongoDB Atlas database. It provides functionalities for:

* **Connection:** Establishes a connection to the MongoDB Atlas instance using the provided connection URI and database name.  Includes a `ping()` method for testing connectivity.
* **Collection Access:** Retrieves a specific collection from the database.
* **CRUD Operations:** Performs Create, Read, Update, and Delete (CRUD) operations on user data within the specified collection.  This includes adding new users, retrieving user information, updating user search history and read books, and deleting user accounts.

**Key Functions:**

* `__init__(self, altas_uri, dbname)`: Initializes the MongoDB client and selects the database.
* `ping()`: Tests the connection to the MongoDB Atlas instance.
* `get_collection(self, collection_name)`: Returns a specific collection object.
* `find(self, collection_name, filter={}, limit=0)`: Executes a MongoDB find query.
* `insert(self, collection_name, user_info)`: Inserts a new document into the collection.
* `delete(self, collection_name, user_id)`: Deletes a document from the collection.
* `update(self, collection_name, user_id, new_value)`: Updates a document in the collection.


**Example Usage (Python):**

```python
from mongo import AtlasClient

atlas_client = AtlasClient("mongodb+srv://...", "project")  # Replace with your connection string
collection = atlas_client.get_collection("user")

# Insert a new user
user_info = {"username": "testuser", "email": "test@example.com", "search_history": [], "read_books": []}
atlas_client.insert("user", user_info)

# Find users
users = atlas_client.find("user", {"email": "test@example.com"})
print(users)
```

### 2.2. Elasticsearch Interaction Module

This module manages interactions with the Elasticsearch cluster. It allows for:

* **Connection:** Establishes a connection to the Elasticsearch cluster using cloud ID and API key.
* **Index Management:** Creates and deletes indices (if needed).  Handles index mappings to accommodate vector embeddings for semantic search.
* **Data Insertion:** Inserts book data into the Elasticsearch index, including vector embeddings generated using Sentence Transformers.
* **Search Operations:** Performs both semantic similarity search using k-NN and faceted filtering based on book attributes.  Updates search counters for each book retrieved.

**Key Functions:**  (These are implied by the code, not explicitly named functions)

* `connect_to_elasticsearch()`: Establishes the connection to the Elasticsearch cluster.
* `create_index()`: Creates the Elasticsearch index with the necessary mappings for vector search and other fields.
* `insert_books()`: Inserts book data into the Elasticsearch index.
* `semantic_search()`: Performs a semantic search based on a given query using k-NN search against the summary vector.
* `faceted_search()`: Performs a search using faceted filters.
* `update_search_count()`: Increments the search count for a book after a successful search.


### 2.3. User Authentication Module

This module (implemented within `firebase.ts`) handles user authentication using Firebase.  It provides:

* **Sign-in:** Allows users to sign in using email/password or Google authentication.
* **Sign-up:** Enables users to create new accounts.
* **Password Reset:** Facilitates password reset via email.
* **Sign-out:** Logs users out of the application.

**Key Functions:** (From Firebase SDKs)

* `signInWithEmailAndPassword()`: Firebase Authentication function
* `createUserWithEmailAndPassword()`: Firebase Authentication function
* `sendPasswordResetEmail()`: Firebase Authentication function
* `signOut()`: Firebase Authentication function
* `signInWithPopup()`: Firebase Authentication function
* `updateProfile()`: Firebase Authentication function


### 2.4. Search Module

This module (within `mongo.py` and Flask routes) combines the functionalities of the MongoDB and Elasticsearch modules to provide search capabilities. It handles:

* **Search Query Handling:** Receives search queries from the frontend.
* **Semantic Search Execution:** Executes semantic similarity search using the Elasticsearch module.
* **Faceted Search Execution:** Executes faceted filtering searches based on user inputs.
* **Result Processing:** Processes and formats search results for the frontend.


### 2.5. Recommendation Module

This module (within `mongo.py` and Flask routes) provides personalized book recommendations. It:

* **User Data Retrieval:** Retrieves user search history and read books from MongoDB.
* **Recommendation Generation:** Generates recommendations based on the user's search history, employing semantic similarity search in Elasticsearch to find books similar to those previously searched, excluding books already read.
* **Result Formatting:** Formats recommendations for the frontend.

### 2.6. Frontend Module

This module (React components) comprises the user interface of the application. It:

* **User Interface:** Provides the user interface elements for user authentication, search, and displaying recommendations.
* **State Management:** Manages application state using Zustand for efficient state updates.
* **Styling:** Uses Tailwind CSS for responsive styling.
* **Routing:** Implements client-side routing using `react-router-dom`.


## 3. Key Functions and Usage

The key functions are dispersed across the Python backend and React frontend.  Detailed examples are provided within the code comments, but here's a high-level summary:

**Backend (Python):** The `/register`, `/delete`, `/searched`, `/read`, `/elasticsearch/summary`, `/elasticsearch/filter`, `/elasticsearch/popular`, and `/elasticsearch/customize` routes handle user account management, search history updates, and different types of searches and recommendations.

**Frontend (React):**  The `SignIn`, `SignUp`, `PasswordReset`, `Dashboard` components handle user interaction, display search results and recommendations, and manage user state.  `handleSearchInputChange`, `handleFacetedSearch`, and other functions within `Dashboard.tsx` interact with the backend APIs.


## 4. Deployment

1. **Prerequisites:** Ensure you have Python, Node.js, npm (or yarn), MongoDB Atlas, and an Elasticsearch cluster set up. Install the required Python packages (`pip install pymongo flask elasticsearch sentence-transformers pyyaml`).  Install Node.js dependencies (`npm install` in the frontend directory).

2. **Configuration:** Create a `config.yaml` file in the project root directory with your MongoDB connection string, Elasticsearch cloud ID and API key, and data URL.  Also configure your Firebase project in `firebase.ts`.

3. **Backend:** Run the backend using `python mongo.py`. This will start the Flask development server.

4. **Frontend:** Navigate to the frontend directory (`cd src`) and run `npm run dev` to start the frontend development server.

5. **Testing:** Thoroughly test all functionalities, including user authentication, search, filtering, and recommendations.

6. **Production Deployment:** For production, consider using a production-ready web server (like Nginx or Apache) to serve the frontend, and deploy the backend to a suitable platform (like Heroku, AWS, or Google Cloud).  Ensure your database and Elasticsearch cluster are properly scaled for production load.  Build the React app for production using `npm run build` and deploy the generated build artifacts.


This documentation provides a comprehensive overview of the ConMan project.  For more specific details, refer to the individual code files.  Remember to replace placeholder values (database connection strings, API keys, etc.) with your actual credentials.