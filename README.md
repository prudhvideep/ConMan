# ConMan Project Documentation

## Table of Contents

- [1. Overview](#1-overview)
- [2. Modules](#2-modules)

  - [2.1. MongoDB Interaction Module (`mongo.py`)](#21-mongodb-interaction-module-mongopy)
  - [2.2. Elasticsearch Interaction Module](#22-elasticsearch-interaction-module)
  - [2.3. Authentication Module](#23-authentication-module)
  - [2.4. User Interface Module](#24-user-interface-module)
  - [2.5. Search Module](#25-search-module)
  - [2.6. Recommendation Module](#26-recommendation-module)
  - [2.7. State Management Module](#27-state-management-module)

- [3. Deployment](#3-deployment)

## 1. Overview

ConMan is a book search and recommendation application built using a combination of Flask (backend), React (frontend), MongoDB (database), and Elasticsearch (search engine). The application allows users to register accounts, search for books using semantic search or faceted search, and receive personalized recommendations based on their search history and reading habits.

## 2. Modules

### 2.1. MongoDB Interaction Module (`mongo.py`)

This module handles all interactions with the MongoDB Atlas database. It provides functions for:

- **Database Connection:** Establishes a connection to the specified MongoDB Atlas instance.
- **Collection Access:** Retrieves a specific collection within the database.
- **CRUD Operations:** Provides methods for Create (insert), Read (find), Update (update), and Delete (delete) operations on user data.

**Key Functions:**

- `__init__(self, altas_uri, dbname)`: Initializes the MongoDB client with the connection URI and database name.
- `ping(self)`: Checks the connection to the MongoDB Atlas instance.
- `get_collection(self, collection_name)`: Returns the specified collection object.
- `find(self, collection_name, filter={}, limit=0)`: Retrieves documents from the specified collection based on the filter criteria. Returns a list of dictionaries.
- `insert(self, collection_name, user_info)`: Inserts a new document into the specified collection. Returns an insert result object.
- `delete(self, collection_name, user_id)`: Deletes a document from the specified collection based on the provided `user_id`. Returns a delete result object.
- `update(self, collection_name, user_id, new_value)`: Updates a document in the specified collection. Returns an update result object.

**Example Usage (Python):**

```python
atlas_client = AtlasClient(url, DB_NAME)
users = atlas_client.find(COLLECTION_NAME, {"email": "test@example.com"})
print(users)
```

### 2.2. Elasticsearch Interaction Module

This module manages interactions with the Elasticsearch cluster. It handles indexing books, searching, filtering, and updating search counts.

**Key Functions (implicitly defined in `mongo.py`):**

- **Index Creation:** Creates an Elasticsearch index with specified mappings (if it doesn't exist).
- **Bulk Indexing:** Indexes a large number of books efficiently.
- `search(index, knn/query)`: Performs a k-Nearest Neighbor search using sentence embeddings for semantic search or a boolean query for faceted search.
- `update(index, id, body)`: Updates a document in the index (used to increment the search count).

### 2.3. Authentication Module (`firebase.ts`)

This module handles user authentication using Firebase Authentication. It provides methods for:

- **Email/Password Authentication:** Allows users to sign in with their email and password.
- **Google Sign-In:** Enables users to sign in using their Google accounts.
- **Password Reset:** Provides functionality for users to reset their passwords via email.
- **User Creation:** Creates new user accounts.

### 2.4. User Interface Module (`App.tsx`, related React components)

This module comprises the React components that constitute the user interface. It includes:

- **Sign-in/Sign-up Pages:** Forms for user authentication and registration.
- **Dashboard:** Displays the main application screen with search functionality, popular books, and resources.
- **Password Reset Page:** Allows users to request a password reset.

### 2.5. Search Module (Flask routes in `mongo.py`)

This module implements the search functionality, integrating with Elasticsearch. It offers:

- **Semantic Search:** Searches for books based on the semantic similarity of the search query to book summaries using sentence embeddings.
- **Faceted Search:** Allows users to filter books based on criteria like author, title, genre, ISBN, and publisher.
- **Popular Searches:** Displays a list of books ordered by search count.

### 2.6. Recommendation Module (Flask routes in `mongo.py`)

This module generates personalized book recommendations:

- **Recommendation Algorithm:** Recommends books to users based on their search history using semantic similarity. Avoids recommending books already read by the user.

### 2.7. State Management Module (`themeStore.ts`, `userStore.ts`, `createSelectors.ts`)

This module uses Zustand for state management within the React application. It handles:

- **Theme:** Manages the application's dark/light theme.
- **User Data:** Stores user information (email, username, etc.) and authentication status.

## 3. Deployment

1. **Prerequisites:**

   - Python 3.x
   - Node.js and npm (or yarn)
   - MongoDB Atlas account
   - Elasticsearch cluster (e.g., on Elastic Cloud)
   - Firebase project
   - Sentence Transformers library (`pip install sentence-transformers`)
   - PyMongo library (`pip install pymongo`)
   - Flask (`pip install Flask`)
   - Other Python libraries listed in `requirements.txt`

2. **Backend Setup:**

   - Create a `config.yaml` file with your MongoDB Atlas connection URI, Elastic Cloud ID, API key, data URL, and port.
   - Install Python dependencies: `pip install -r requirements.txt`
   - Run the Flask application: `python mongo.py`

3. **Frontend Setup:**

   - Install Node.js dependencies: `npm install`
   - Create environment variables from the `.env.example` file and update the relevant values for your project.
   - Run the development server: `npm run dev`

4. **Firebase Setup:**
   - Create a Firebase project.
   - Configure Firebase in your React application using the `firebase.ts` file and environment variables.
