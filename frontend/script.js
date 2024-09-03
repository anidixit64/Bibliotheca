document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('book-form');
    const bookIdInput = document.getElementById('book-id');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const readInput = document.getElementById('read');
    const unreadBookList = document.getElementById('unread-books');
    const readBookList = document.getElementById('read-books');
    const finalizeButton = document.getElementById('finalize-edit');

    // Fetch and display books
    function fetchBooks() {
        fetch('/books')
            .then(response => response.json())
            .then(books => {
                unreadBookList.innerHTML = '';
                readBookList.innerHTML = '';
                books.forEach(book => {
                    const li = document.createElement('li');
                    li.className = 'book-item';
                    li.innerHTML = `
                        <div class="book-info">
                            <span class="book-title">${book.title}</span>
                            <span class="book-author">by ${book.author}</span>
                        </div>
                        <div class="book-actions">
                            <button class="edit-btn" data-id="${book.id}">Edit</button>
                            <button class="delete-btn" data-id="${book.id}">Delete</button>
                        </div>
                    `;
                    if (book.read) {
                        readBookList.appendChild(li);
                    } else {
                        unreadBookList.appendChild(li);
                    }
                });
            });
    }

    // Submit book (create or update)
    function submitBook() {
        const id = bookIdInput.value;
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const read = readInput.checked;

        if (!title || !author) {
            alert('Both title and author fields are required.');
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/books/${id}` : '/books';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author, read }),
        }).then(() => {
            fetchBooks();
            resetForm();
        });
    }

    // Edit book
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

    // Finalize edit
    function finalizeEdit() {
        const id = bookIdInput.value;
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const read = readInput.checked;

        if (!title || !author) {
            alert('Both title and author fields are required.');
            return;
        }

        fetch(`/books/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author, read }),
        }).then(() => {
            fetchBooks();
            resetForm();
        });
    }

    // Delete book
    function deleteBook(id) {
        fetch(`/books/${id}`, {
            method: 'DELETE',
        }).then(() => {
            if (bookIdInput.value === id.toString()) {
                resetForm(); 
            }
            fetchBooks();
        });
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

    // Allow form submission with Enter key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (titleInput === document.activeElement || authorInput === document.activeElement)) {
            e.preventDefault();
            if (bookIdInput.value) {
                finalizeEdit();
            } else {
                submitBook();
            }
        }
    });

    // Event listeners
    bookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        submitBook();
    });

    finalizeButton.addEventListener('click', finalizeEdit);

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
            editBook(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteBook(e.target.dataset.id);
        }
    });

    // Initial fetch of books
    fetchBooks();
});
