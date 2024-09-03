document.addEventListener('DOMContentLoaded', function () {
    console.log('Script loaded');  // Add this line
    const bookForm = document.getElementById('book-form');
    if (!bookForm) {
        console.error('Form element not found');
        return;
    }
    console.log('Form element found'); 
    const bookIdInput = document.getElementById('book-id');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const readInput = document.getElementById('read');
    const bookList = document.getElementById('books');
    const finalizeButton = document.getElementById('finalize-edit');

    function fetchBooks() {
        console.log("Fetching books");
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
            });
    }

    function submitBook() {
        console.log('Submitting book');
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
        }).then(() => {
            fetchBooks();
            resetForm();
        });
    }    

    function editBook(id) {
        console.log("Editing Book");
    
        // Fetch the book details to populate the form fields
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
                bookIdInput.value = book.id; // Set book ID in the hidden field
    
                // Show the Finalize button and hide the Submit button
                finalizeButton.style.display = 'inline-block';
                bookForm.querySelector('button[type="submit"]').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching book:', error);
                alert('Failed to load book details. Please try again.');
            });
    }
    

    function finalizeEdit() {
        console.log('Finalizing edit');
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
        }).then(() => {
            fetchBooks();
            resetForm();
        });
    }

    function deleteBook(id) {
        console.log('Deleting book');
        fetch(`/books/${id}`, {
            method: 'DELETE',
        }).then(() => {
            fetchBooks();
        });
    }

    function resetForm() {
        console.log('Resetting form');
        bookIdInput.value = '';
        titleInput.value = '';
        authorInput.value = '';
        readInput.checked = false;

        // Ensure Finalize button is hidden and Submit button is shown when form is reset
        finalizeButton.style.display = 'none';
        bookForm.querySelector('button[type="submit"]').style.display = 'inline-block';
    }

    bookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('Submit event');  // Add this line
        submitBook()
    });

    finalizeButton.addEventListener('click', function () {
        finalizeEdit();
    });

    bookList.addEventListener('click', function (e) {
        console.log('Click event');
        if (e.target.classList.contains('edit-btn')) {
            editBook(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteBook(e.target.dataset.id);
        }
    });

    fetchBooks();
});