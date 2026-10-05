// ===== Загрузка данных из JSON =====
let movies = [];
let reviews = [];

// Загружаем фильмы
fetch('data/movies.json')
    .then(res => res.json())
    .then(data => {
        movies = data;
        // Если функция отрисовки существует на странице — вызываем её
        if (typeof renderMovies === 'function') renderMovies(movies);
        if (typeof renderRating === 'function') renderRating(movies);
        if (typeof renderMovieDetail === 'function') renderMovieDetail();
    });

// Загружаем рецензии
fetch('data/reviews.json')
    .then(res => res.json())
    .then(data => {
        reviews = data;
        if (typeof renderReviews === 'function') renderReviews(reviews);
    });

// ===== Поиск и фильтрация (страница movies.html) =====
function applyFilters() {
    const search = document.getElementById('search').value.toLowerCase();
    const genre = document.getElementById('genre').value;
    const year = document.getElementById('year').value;

    const filtered = movies.filter(m => {
        const matchSearch = m.title.toLowerCase().includes(search);
        const matchGenre = !genre || m.genre === genre;
        const matchYear = !year || m.year == year;
        return matchSearch && matchGenre && matchYear;
    });

    renderMovies(filtered);
}

// ===== Отрисовка карточек фильмов =====
function renderMovies(list) {
    const container = document.getElementById('movies-grid');
    if (!container) return;
    container.innerHTML = list.map(m => `
        <div class="movie-card" onclick="location.href='movie.html?id=${m.id}'">
            <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/220x300/1a1a1a/ff1744?text=No+Image'">
            <h3>${m.title}</h3>
            <div class="info">${m.year} • ${m.genre}</div>
            <span class="rating-badge">★ ${m.rating}</span>
        </div>
    `).join('');
}

// ===== Отрисовка рецензий =====
function renderReviews(list) {
    const container = document.getElementById('reviews-list');
    if (!container) return;
    container.innerHTML = list.map(r => {
        const movie = movies.find(m => m.id === r.movieId);
        return `
            <div class="review">
                <span class="author">${r.author}</span>
                <span class="date">${r.date}</span>
                <span class="rating-badge">★ ${r.rating}</span>
                ${movie ? `<div style="color:#ffb3c1;margin-top:5px;">Фильм: ${movie.title}</div>` : ''}
                <div class="text">${r.text}</div>
            </div>
        `;
    }).join('');
}

// ===== Рейтинг (таблица) =====
function renderRating(list) {
    const container = document.getElementById('rating-table');
    if (!container) return;
    const sorted = [...list].sort((a, b) => b.rating - a.rating);
    container.innerHTML = `
        <table>
            <tr><th>#</th><th>Фильм</th><th>Год</th><th>Жанр</th><th>Рейтинг</th></tr>
            ${sorted.map((m, i) => `
                <tr onclick="location.href='movie.html?id=${m.id}'" style="cursor:pointer">
                    <td>${i + 1}</td>
                    <td>${m.title}</td>
                    <td>${m.year}</td>
                    <td>${m.genre}</td>
                    <td><span class="rating-badge">★ ${m.rating}</span></td>
                </tr>
            `).join('')}
        </table>
    `;
}

// ===== Страница одного фильма =====
function renderMovieDetail() {
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get('id'));
    const movie = movies.find(m => m.id === id);
    const container = document.getElementById('movie-detail');
    if (!container || !movie) return;

    const movieReviews = reviews.filter(r => r.movieId === id);

    container.innerHTML = `
        <h2>${movie.title}</h2>
        <p><strong>Режиссёр:</strong> ${movie.director} | <strong>Год:</strong> ${movie.year} | <strong>Жанр:</strong> ${movie.genre}</p>
        <span class="rating-badge">★ ${movie.rating}</span>
        <p style="margin-top:15px;">${movie.description}</p>

        <h3 style="color:#ffb3c1;margin-top:30px;">Рецензии (${movieReviews.length})</h3>
        <div id="movie-reviews">
            ${movieReviews.length ? movieReviews.map(r => `
                <div class="review">
                    <span class="author">${r.author}</span>
                    <span class="date">${r.date}</span>
                    <span class="rating-badge">★ ${r.rating}</span>
                    <div class="text">${r.text}</div>
                </div>
            `).join('') : '<p>Пока нет рецензий. Будьте первым!</p>'}
        </div>

        <h3 style="color:#ffb3c1;margin-top:30px;">Оставить рецензию</h3>
        <form onsubmit="submitReview(event, ${id})">
            <input type="text" id="rev-author" placeholder="Ваше имя" required>
            <select id="rev-rating" required>
                <option value="">Оценка</option>
                ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
            <textarea id="rev-text" rows="4" placeholder="Ваша рецензия..." required></textarea>
            <button type="submit">Отправить</button>
        </form>
    `;
}

// ===== Отправка новой рецензии =====
function submitReview(e, movieId) {
    e.preventDefault();
    const newReview = {
        id: reviews.length + 1,
        movieId: movieId,
        author: document.getElementById('rev-author').value,
        rating: parseInt(document.getElementById('rev-rating').value),
        text: document.getElementById('rev-text').value,
        date: new Date().toISOString().split('T')[0]
    };
    reviews.push(newReview);
    alert('Спасибо за рецензию! (в реальной версии — сохранение в БД)');
    renderMovieDetail();
}