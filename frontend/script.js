document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('book-form');
    const bookIdInput = document.getElementById('book-id');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const readInput = document.getElementById('read');
    const bookList = document.getElementById('books');
    const finalizeButton = document.getElementById('finalize-edit');

    // Fetch books and render them in the list
    function fetchBooks() {
        fetch('/books')
            .then(response => response.json())
            .then(books => {
                bookList.innerHTML = '';
                books.forEach(book => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${book.title} by ${book.author} [${book.read ? 'Read' : 'Unread'}]</span>
                        <div>
                            <button class="edit-btn" data-id="${book.id}">Edit</button>
                            <button class="delete-btn" data-id="${book.id}">Delete</button>
                        </div>
                    `;
                    bookList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching books:', error));
    }

    // Submit book (create or update based on the book ID presence)
    function submitBook() {
        const id = bookIdInput.value;
        const title = titleInput.value;
        const author = authorInput.value;
        const read = readInput.checked;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/books/${id}` : '/books';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author, read }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to submit the book');
            }
            fetchBooks();
            resetForm();
        })
        .catch(error => console.error('Error submitting book:', error));
    }    

    // Edit a book and populate the form with its details
    function editBook(id) {
        fetch(`/books/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Book with ID ${id} not found`);
                }
                return response.json();
            })
            .then(book => {
                titleInput.value = book.title;
                authorInput.value = book.author;
                readInput.checked = book.read;
                bookIdInput.value = book.id;
                finalizeButton.style.display = 'inline-block';
                bookForm.querySelector('button[type="submit"]').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching book:', error);
                alert('Failed to load book details. Please try again.');
            });
    }

    // Finalize edit by updating the book
    function finalizeEdit() {
        const id = bookIdInput.value;
        const title = titleInput.value;
        const author = authorInput.value;
        const read = readInput.checked;

        fetch(`/books/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author, read }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to finalize edit');
            }
            fetchBooks();
            resetForm();
        })
        .catch(error => console.error('Error finalizing edit:', error));
    }

    // Delete a book by ID
    function deleteBook(id) {
        fetch(`/books/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the book');
            }
            fetchBooks();
        })
        .catch(error => console.error('Error deleting book:', error));
    }

    // Reset the form fields and visibility of buttons
    function resetForm() {
        bookIdInput.value = '';
        titleInput.value = '';
        authorInput.value = '';
        readInput.checked = false;
        finalizeButton.style.display = 'none';
        bookForm.querySelector('button[type="submit"]').style.display = 'inline-block';
    }

    // Event listeners
    bookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        submitBook();
    });

    finalizeButton.addEventListener('click', finalizeEdit);

    bookList.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
            editBook(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteBook(e.target.dataset.id);
        }
    });

    // Initial fetch of books
    fetchBooks();
});
