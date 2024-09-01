import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='../frontend', static_url_path='')

    # Configure the SQLite database to be in the backend directory
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(app.root_path, "books.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()

    # CRUD routes
    @app.route('/books', methods=['GET'])
    def get_books():
        books = Book.query.all()
        return jsonify([{'id': book.id, 'title': book.title, 'author': book.author, 'read': book.read} for book in books]) 
    
    # Add this route to fetch a single book by ID
    @app.route('/books/<int:book_id>', methods=['GET'])
    def get_book(book_id):
        book = Book.query.get_or_404(book_id)  # This will automatically return a 404 if the book is not found
        return jsonify({'id': book.id, 'title': book.title, 'author': book.author, 'read': book.read})


    @app.route('/books', methods=['POST'])
    def add_book():
        new_book = Book(title=request.json['title'], author=request.json['author'], read=request.json.get('read', False))
        db.session.add(new_book)
        db.session.commit()
        return jsonify({'id': new_book.id}), 201

    @app.route('/books/<int:book_id>', methods=['PUT'])
    def update_book(book_id):
        book = Book.query.get_or_404(book_id)
        data = request.get_json()  # Ensure request.json or request.get_json() is used correctly
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.read = data.get('read', book.read)
        db.session.commit()
        return jsonify({'id': book.id})


    @app.route('/books/<int:book_id>', methods=['DELETE'])
    def delete_book(book_id):
        book = Book.query.get_or_404(book_id)
        db.session.delete(book)
        db.session.commit()
        return '', 204

    # Serve the frontend
    @app.route('/')
    def home():
        return send_from_directory(app.static_folder, 'index.html')

    return app

# Define the Book model
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    author = db.Column(db.String(120), nullable=False)
    read = db.Column(db.Boolean, default=False)

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)