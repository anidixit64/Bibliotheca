document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('book-form');
    const bookIdInput = document.getElementById('book-id');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const readInput = document.getElementById('read');
    const bookList = document.getElementById('books');

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

        console.log('Submitting book:', { title, author, read });

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
        fetch(`/books/${id}`)
            .then(response => response.json())
            .then(book => {
                bookIdInput.value = book.id;
                titleInput.value = book.title;
                authorInput.value = book.author;
                readInput.checked = book.read;
            });
    }

    function deleteBook(id) {
        fetch(`/books/${id}`, {
            method: 'DELETE',
        }).then(() => {
            fetchBooks();
        });
    }

    function resetForm() {
        bookIdInput.value = '';
        titleInput.value = '';
        authorInput.value = '';
        readInput.checked = false;
    }

    bookForm.addEventListener('submit', function (e) {
        console.log('Clicked')
        e.preventDefault();
        resetForm()
    });

    bookList.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
            editBook(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteBook(e.target.dataset.id);
        }
    });

    fetchBooks();
});
