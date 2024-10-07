import { apiURL, apiToken } from "./config.js";
import { imageUrl } from "./contants.js";
import { debounce } from "./utils.js";

const app = document.querySelector(".app");

// основна структура

const searchInput = document.createElement("input");
searchInput.setAttribute("id", "search-input");
searchInput.setAttribute("placeholder", "Search Movies or TV Shows");
app.appendChild(searchInput);

const moviesBtn = document.createElement("button");
moviesBtn.setAttribute("id", "movies-btn");
moviesBtn.textContent = "Movies";
app.appendChild(moviesBtn);

const serialsBtn = document.createElement("button");
serialsBtn.setAttribute("id", "serials-btn");
serialsBtn.textContent = "Serials ";
app.appendChild(serialsBtn);

const listMovie = document.createElement("div");
listMovie.setAttribute("id", "list-movies");
app.appendChild(listMovie);

const detailsMovie = document.createElement("div");
detailsMovie.setAttribute("id", "details-movies");
detailsMovie.classList.add("hidden");
app.appendChild(detailsMovie);

const backBtn = document.createElement("button");
backBtn.setAttribute("id", "back-btn");
backBtn.textContent = "Back";
detailsMovie.appendChild(backBtn);

const titleMovies = document.createElement("h2");
titleMovies.setAttribute("id", "title-movie");
detailsMovie.appendChild(titleMovies);

const imageMovie = document.createElement("img");
imageMovie.setAttribute("id", "image-movie");
detailsMovie.appendChild(imageMovie);

const descriptionMovie = document.createElement("p");
descriptionMovie.setAttribute("id", "description-movie");
detailsMovie.appendChild(descriptionMovie);

const starsContainer = document.createElement("div");
starsContainer.setAttribute("id", "stars-container");
detailsMovie.appendChild(starsContainer);

const recommendationList = document.createElement("ul");
recommendationList.setAttribute("id", "recommendation-list");
detailsMovie.appendChild(recommendationList);

// Завантаження популярних фільмів або серіалів
loadPopularMovies("movie");

moviesBtn.addEventListener("click", () => loadPopularMovies("movie"));
serialsBtn.addEventListener("click", () => loadPopularMovies("tv"));

searchInput.addEventListener("input", debounce(searchMovies, 2000));

backBtn.addEventListener("click", () => {
  detailsMovie.classList.add("hidden");
  listMovie.style.display = "flex";
  window.history.back();
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

//Пошукова система
async function searchMovies() {
  const query = searchInput.value;
  if (!query.trim()) {
    loadPopularMovies("movie");
    return;
  }

  const url = `${apiURL}/search/movie?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    displayMovies(data.results, "movie");
  } else {
    console.error("Error:", response.statusText);
  }
}

// Відображення списку фільмів або серіалів
function displayMovies(movies, type) {
  listMovie.innerHTML = "";
  if (!movies || !movies.length) {
    const noResultMsg = document.createElement("p");
    noResultMsg.textContent = "No results found.";
    listMovie.appendChild(noResultMsg);
    return;
  }

  movies.forEach((movie) => {
    const cardMovie = document.createElement("div");

    const img = document.createElement("img");
    img.src = `${imageUrl}${movie.poster_path}`;
    img.alt = movie.title || movie.name;
    cardMovie.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = movie.title || movie.name;
    cardMovie.appendChild(title);

    cardMovie.addEventListener("click", () => loadMovieDetails(movie.id, type));
    listMovie.appendChild(cardMovie);
  });
}

// Завантаження деталей фільму або серіалу
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
    displayMovieDetails(movie);
  } catch (error) {
    console.error("Error loading movie details:", error);
  }
}

// Відображення деталей фільму або серіалу
function displayMovieDetails(movie) {
  titleMovies.textContent = movie.title || movie.name;
  imageMovie.src = `${imageUrl}${movie.poster_path}`;
  descriptionMovie.textContent = movie.overview;

  const rating = Math.ceil(movie.vote_average / 2);
  displayStars(rating);

  fetchRecommendations(movie.id);

  detailsMovie.classList.remove("hidden");
  listMovie.style.display = "none";
}

// Відображення зірочок рейтингу
function displayStars(rating) {
  starsContainer.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.classList.add("star");
    if (i <= rating) {
      star.textContent = "★";
    } else {
      star.textContent = "☆";
    }
    starsContainer.appendChild(star);
  }
}

//рекомендації
async function fetchRecommendations(movieId) {
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
        loadMovieDetails(recommendation.id)
      );
      recommendationList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
}
