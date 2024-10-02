const apiURL = "https://api.themoviedb.org/3";
const imageUrl = "https://image.tmdb.org/t/p/w500";
const apiToken =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NDk5YTk2YTMzMDZjYWU3N2E3YjBmYWExZjU5MGNiYiIsIm5iZiI6MTcyNzc3MzQzNy40MDI1OTgsInN1YiI6IjY2ZmE2NGIwY2M0M2NlYmQwM2YxODI2MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5mze49X_uKZT9eIgoFJo66LhpytEtpgN3KQkqmOF0HM";

const searchInput = document.getElementById("search-input");
const listMovie = document.getElementById("list-movies");
const titleMovies = document.getElementById("title-movie");
const detailsMovie = document.getElementById("details-movies");
const imageMovie = document.getElementById("image-movie");
const descriptionMovie = document.getElementById("description-movie");
const recommendationList = document.getElementById("recommendation-list");
const backBtn = document.getElementById("back-btn");
const moviesBtn = document.getElementById("movies-btn");
const serialsBtn = document.getElementById("serials-btn");
const mainPage = document.getElementById("main-page");

loadPopularMovies("movie");

mainPage.addEventListener("click", () => loadPopularMovies("movie"));
moviesBtn.addEventListener("click", () => loadPopularMovies("movie"));
serialsBtn.addEventListener("click", () => loadPopularMovies("tv"));

searchInput.addEventListener("input", searchMovies);

backBtn.addEventListener("click", () => {
  detailsMovie.classList.add("hidden");
  listMovie.style.display = "flex";
});

// Завантаження популярних фільмів або серіалів
async function loadPopularMovies(type) {
  const url = `${apiURL}/${type}/popular`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    displayMovies(data.results, type);
  } else {
    console.error("Error:", response.statusText);
  }
}
//пошук фільмів/серіалів
async function searchMovies() {
  const query = searchInput.value;
  if (!query.trim()) {
    loadPopularMovies("movie");
    return;
  }

  const url = `${apiURL}/search/movie`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  };

  try {
    const response = await fetch(
      `${url}?query=${encodeURIComponent(query)}`,
      options
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    displayMovies(data.results, "movie");
  } catch (error) {
    console.error("Error searching movies:", error);
  }
}

// Відображення списку фільмів або серіалів
function displayMovies(movies, type) {
  listMovie.innerHTML = "";
  if (!movies || !movies.length) {
    listMovie.innerHTML = "<p>No results found.</p>";
    return;
  }

  movies.forEach((movie) => {
    const cardMovie = document.createElement("div");
    cardMovie.innerHTML = `
      <img src="${imageUrl}${movie.poster_path}" alt="${
      movie.title || movie.name
    }">
      <h3>${movie.title || movie.name}</h3>
    `;
    cardMovie.addEventListener("click", () => loadMovieDetails(movie.id, type));
    listMovie.appendChild(cardMovie);
  });
}

// Завантаження деталей фільму або серіалу за ID
async function loadMovieDetails(movieId, type) {
  const url = `${apiURL}/${type}/${movieId}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const movie = await response.json();
    displayMovieDetails(movie, type);
  } catch (error) {
    console.error("Error loading movie details:", error);
  }
}

// Завантаження рекомендацій
async function fetchRecommendations(movieId) {
  if (!movieId) {
    console.error("Movie ID is undefined");
    return;
  }

  const url = `${apiURL}/movie/${movieId}/recommendations`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    recommendationList.innerHTML = "";
    data.results.forEach((recommendation) => {
      const listItem = document.createElement("li");
      listItem.textContent = recommendation.title;
      listItem.addEventListener("click", () =>
        loadMovieDetails(recommendation.id, recommendation.media_type)
      );
      recommendationList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
}

// Відображення деталей фільму або серіалу
function displayMovieDetails(movie, type) {
  titleMovies.textContent = movie.title || movie.name;
  imageMovie.src = `${imageUrl}${movie.poster_path}`;
  descriptionMovie.textContent = movie.overview;

  fetchRecommendations(movie.id, type);

  detailsMovie.classList.remove("hidden");
  listMovie.style.display = "none";
}
