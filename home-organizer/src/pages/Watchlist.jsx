import { useEffect, useMemo, useState } from "react";
import {
    Check,
    Film,
    LayoutGrid,
    List,
    LoaderCircle,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Shuffle,
    Trash2,
} from "lucide-react";

import MovieForm from "../components/movies/MovieForm";
import WatchedForm from "../components/movies/WatchedForm";

import {
    addMovie,
    deleteMovie,
    getMovies,
    markMovieWatched,
    moveMovieToWatchlist,
    updateMovie,
} from "../services/movieService";

import "../styles/movies.css";

const sections = [
    { id: "watchlist", label: "Watchlist" },
    { id: "watched", label: "Watched" },
    { id: "randomizer", label: "Randomizer" },
    { id: "stats", label: "Stats" },
];

function formatRuntime(runtimeMinutes) {
    if (!runtimeMinutes) {
        return "Runtime unknown";
    }

    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
}

function formatDate(dateString) {
    if (!dateString) {
        return "Date unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${dateString}T00:00:00Z`));
}

function displayRating(movie) {
    const ratings = [
        movie.maddieRating,
        movie.nickRating,
    ].filter((rating) => rating !== null && rating !== undefined);

    if (ratings.length === 0) {
        return "Not rated";
    }

    const average =
        ratings.reduce((total, rating) => total + rating, 0) /
        ratings.length;

    return `${average.toFixed(1)} / 5`;
}

function Watchlist() {
    const [movies, setMovies] = useState([]);
    const [activeSection, setActiveSection] = useState("watchlist");
    const [view, setView] = useState(
        () => localStorage.getItem("movieView") || "list"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [showMovieForm, setShowMovieForm] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [editingMovie, setEditingMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadMovies() {
        try {
            setError("");
            setIsLoading(true);

            const movieData = await getMovies();
            setMovies(movieData);
        } catch (loadError) {
            console.error(loadError);
            setError("We couldn't load your movies. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadMovies();
    }, []);

    function changeView(nextView) {
        setView(nextView);
        localStorage.setItem("movieView", nextView);
    }

    function changeSection(sectionId) {
        setActiveSection(sectionId);
        setSearchTerm("");
    }

    async function handleAddMovie(movieData) {
        try {
            setError("");
            setIsSaving(true);

            await addMovie(movieData);
            await loadMovies();

            setShowMovieForm(false);
        } catch (saveError) {
            console.error(saveError);
            setError("We couldn't save that movie. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleUpdateMovie(movieData) {
        if (!editingMovie) {
            return;
        }

        try {
            setError("");
            setIsSaving(true);

            await updateMovie(editingMovie.id, movieData);
            await loadMovies();

            setEditingMovie(null);
        } catch (saveError) {
            console.error(saveError);
            setError(
                "We couldn't update that movie. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleMarkWatched(movieId, watchedDetails) {
        try {
            setError("");
            setIsSaving(true);

            await markMovieWatched(movieId, watchedDetails);
            await loadMovies();

            setSelectedMovie(null);
            setActiveSection("watched");
        } catch (saveError) {
            console.error(saveError);
            setError(
                "We couldn't update that movie. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleMoveToWatchlist(movie) {
        try {
            setError("");

            await moveMovieToWatchlist(movie.id);
            await loadMovies();
        } catch (moveError) {
            console.error(moveError);
            setError(
                "We couldn't return that movie to the watchlist."
            );
        }
    }

    async function handleDeleteMovie(movie) {
        const shouldDelete = window.confirm(
            `Permanently delete "${movie.title}"?`
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setError("");

            await deleteMovie(movie.id);

            setMovies((currentMovies) =>
                currentMovies.filter(
                    (currentMovie) => currentMovie.id !== movie.id
                )
            );
        } catch (deleteError) {
            console.error(deleteError);
            setError("We couldn't delete that movie. Please try again.");
        }
    }

    const watchlistMovies = useMemo(
        () => movies.filter((movie) => movie.status === "watchlist"),
        [movies]
    );

    const watchedMovies = useMemo(() => {
        return movies
            .filter((movie) => movie.status === "watched")
            .sort((firstMovie, secondMovie) =>
                (secondMovie.watchedDate || "").localeCompare(
                    firstMovie.watchedDate || ""
                )
            );
    }, [movies]);

    const currentMovies =
        activeSection === "watched"
            ? watchedMovies
            : watchlistMovies;

    const filteredMovies = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return currentMovies;
        }

        return currentMovies.filter((movie) => {
            const searchableValues = [
                movie.title,
                movie.releaseYear,
                movie.suggestedBy,
                ...(movie.genres || []),
                ...(movie.streamingServices || []),
            ];

            return searchableValues.some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(normalizedSearch)
            );
        });
    }, [currentMovies, searchTerm]);

    const moviesByGenre = useMemo(() => {
        return filteredMovies.reduce((groups, movie) => {
            const genres =
                movie.genres?.length > 0
                    ? movie.genres
                    : ["Uncategorized"];

            genres.forEach((genre) => {
                if (!groups[genre]) {
                    groups[genre] = [];
                }

                groups[genre].push(movie);
            });

            return groups;
        }, {});
    }, [filteredMovies]);

    function renderMovieActions(movie) {
        if (movie.status === "watched") {
            return (
                <div className="movie-row-actions">
                    <button
                        className="movie-icon-action"
                        type="button"
                        title="Edit movie"
                        aria-label={`Edit ${movie.title}`}
                        onClick={() => setEditingMovie(movie)}
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        className="movie-icon-action"
                        type="button"
                        title="Return to watchlist"
                        aria-label={`Return ${movie.title} to watchlist`}
                        onClick={() => handleMoveToWatchlist(movie)}
                    >
                        <RotateCcw size={17} />
                    </button>

                    <button
                        className="movie-delete"
                        type="button"
                        title="Delete"
                        aria-label={`Delete ${movie.title}`}
                        onClick={() => handleDeleteMovie(movie)}
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            );
        }

        return (
            <div className="movie-row-actions">
                <button
                    className="movie-icon-action"
                    type="button"
                    title="Edit movie"
                    aria-label={`Edit ${movie.title}`}
                    onClick={() => setEditingMovie(movie)}
                >
                    <Pencil size={16} />
                </button>

                <button
                    className="movie-icon-action movie-icon-action--complete"
                    type="button"
                    title="Mark watched"
                    aria-label={`Mark ${movie.title} as watched`}
                    onClick={() => setSelectedMovie(movie)}
                >
                    <Check size={18} />
                </button>

                <button
                    className="movie-delete"
                    type="button"
                    title="Delete"
                    aria-label={`Delete ${movie.title}`}
                    onClick={() => handleDeleteMovie(movie)}
                >
                    <Trash2 size={17} />
                </button>
            </div>
        );
    }

    function renderListView() {
        return (
            <section className="movie-list-card">
                <div className="movie-list-header">
                    <span>Movie</span>
                    <span>Genres</span>
                    <span>
                        {activeSection === "watched"
                            ? "Watched"
                            : "Watch on"}
                    </span>
                    <span>
                        {activeSection === "watched"
                            ? "Rating"
                            : "Suggested by"}
                    </span>
                    <span aria-hidden="true" />
                </div>

                {filteredMovies.map((movie) => (
                    <article className="movie-list-row" key={movie.id}>
                        <div className="movie-primary-info">
                            <div className="movie-thumbnail">
                                {movie.posterUrl ? (
                                    <img
                                        src={movie.posterUrl}
                                        alt={`${movie.title} poster`}
                                        loading="lazy"
                                    />
                                ) : (
                                    <Film size={22} />
                                )}
                            </div>

                            <div>
                                <h3>{movie.title}</h3>

                                <p>
                                    {movie.releaseYear || "Year unknown"}
                                    {" · "}
                                    {formatRuntime(movie.runtimeMinutes)}
                                </p>
                            </div>
                        </div>

                        <div className="movie-tags">
                            {movie.genres?.length ? (
                                movie.genres.map((genre) => (
                                    <span
                                        className="movie-tag"
                                        key={genre}
                                    >
                                        {genre}
                                    </span>
                                ))
                            ) : (
                                <span className="movie-muted">
                                    Uncategorized
                                </span>
                            )}
                        </div>

                        <div className="movie-services">
                            {activeSection === "watched"
                                ? formatDate(movie.watchedDate)
                                : movie.streamingServices?.length
                                    ? movie.streamingServices.join(", ")
                                    : "Not listed"}
                        </div>

                        <div
                            className={
                                activeSection === "watched"
                                    ? "movie-rating"
                                    : "movie-suggester"
                            }
                        >
                            {activeSection === "watched"
                                ? displayRating(movie)
                                : movie.suggestedBy || "Not listed"}
                        </div>

                        {renderMovieActions(movie)}
                    </article>
                ))}
            </section>
        );
    }

    function renderCategoryView() {
        return (
            <section className="category-board">
                {Object.entries(moviesByGenre)
                    .sort(([firstGenre], [secondGenre]) =>
                        firstGenre.localeCompare(secondGenre)
                    )
                    .map(([genre, genreMovies]) => (
                        <article className="genre-column" key={genre}>
                            <header className="genre-column-header">
                                <h3>{genre}</h3>
                                <span>{genreMovies.length}</span>
                            </header>

                            <div className="genre-movie-list">
                                {genreMovies.map((movie) => (
                                    <div
                                        className="genre-movie-card"
                                        key={`${genre}-${movie.id}`}
                                    >
                                        <div className="genre-movie-details">
                                            <div className="genre-movie-poster">
                                                {movie.posterUrl ? (
                                                    <img
                                                        src={movie.posterUrl}
                                                        alt={`${movie.title} poster`}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <Film size={20} />
                                                )}
                                            </div>

                                            <div className="genre-movie-info">
                                                <h4>{movie.title}</h4>

                                                <p>
                                                    {movie.releaseYear || "Year unknown"}
                                                    {" · "}
                                                    {formatRuntime(movie.runtimeMinutes)}
                                                </p>
                                            </div>
                                        </div>

                                        {renderMovieActions(movie)}

                                        {movie.status === "watched" ? (
                                            <>
                                                <span className="service-label">
                                                    {formatDate(
                                                        movie.watchedDate
                                                    )}
                                                </span>

                                                <span className="movie-rating">
                                                    {displayRating(movie)}
                                                </span>
                                            </>
                                        ) : (
                                            movie.streamingServices?.length >
                                            0 && (
                                                <span className="service-label">
                                                    {movie.streamingServices.join(
                                                        ", "
                                                    )}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
            </section>
        );
    }

    function renderMovieCollection() {
        if (isLoading) {
            return (
                <div className="movie-state">
                    <LoaderCircle
                        className="loading-icon"
                        size={34}
                    />
                    <p>Loading your movies...</p>
                </div>
            );
        }

        if (filteredMovies.length === 0) {
            return (
                <div className="movie-state">
                    <div className="movie-state-icon">
                        <Film size={34} />
                    </div>

                    <h3>
                        {searchTerm
                            ? "No movies match your search"
                            : activeSection === "watched"
                                ? "No watched movies yet"
                                : "Your watchlist is empty"}
                    </h3>

                    <p>
                        {searchTerm
                            ? "Try changing your search."
                            : activeSection === "watched"
                                ? "Movies you complete will appear here."
                                : "Add your first movie to plan movie night."}
                    </p>
                </div>
            );
        }

        return view === "list"
            ? renderListView()
            : renderCategoryView();
    }

    function renderComingSoon() {
        const isRandomizer = activeSection === "randomizer";

        return (
            <div className="movie-state">
                <div className="movie-state-icon">
                    {isRandomizer ? (
                        <Shuffle size={34} />
                    ) : (
                        <Film size={34} />
                    )}
                </div>

                <h3>
                    {isRandomizer
                        ? "Random movie selector"
                        : "Movie statistics"}
                </h3>

                <p>
                    {isRandomizer
                        ? "We’ll build the filtered movie randomizer next."
                        : "Your viewing totals, genres, ratings, and movie ages will appear here."}
                </p>
            </div>
        );
    }

    const showCollection =
        activeSection === "watchlist" ||
        activeSection === "watched";

    return (
        <div className="movies-page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">For your next movie night</p>
                    <h2>Movies</h2>
                    <p className="page-description">
                        Save movies, track what you’ve watched, and find
                        your next movie night pick.
                    </p>
                </div>

                <button
                    className="primary-button add-movie-button"
                    type="button"
                    onClick={() => setShowMovieForm(true)}
                >
                    <Plus size={18} />
                    Add movie
                </button>
            </header>

            <nav
                className="movie-section-tabs"
                aria-label="Movie sections"
            >
                {sections.map((section) => {
                    const count =
                        section.id === "watchlist"
                            ? watchlistMovies.length
                            : section.id === "watched"
                                ? watchedMovies.length
                                : null;

                    return (
                        <button
                            key={section.id}
                            className={
                                activeSection === section.id
                                    ? "movie-section-tab movie-section-tab--active"
                                    : "movie-section-tab"
                            }
                            type="button"
                            onClick={() =>
                                changeSection(section.id)
                            }
                        >
                            {section.label}

                            {count !== null && <span>{count}</span>}
                        </button>
                    );
                })}
            </nav>

            {showCollection && (
                <section className="movie-toolbar">
                    <label className="movie-search">
                        <Search size={18} />

                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search movies, genres, or services"
                        />
                    </label>

                    <div
                        className="view-switcher"
                        aria-label="Change movie view"
                    >
                        <button
                            className={
                                view === "list"
                                    ? "view-button view-button--active"
                                    : "view-button"
                            }
                            type="button"
                            onClick={() => changeView("list")}
                        >
                            <List size={18} />
                            <span>List</span>
                        </button>

                        <button
                            className={
                                view === "category"
                                    ? "view-button view-button--active"
                                    : "view-button"
                            }
                            type="button"
                            onClick={() => changeView("category")}
                        >
                            <LayoutGrid size={18} />
                            <span>Categories</span>
                        </button>
                    </div>
                </section>
            )}

            {error && <p className="error-message">{error}</p>}

            {showCollection
                ? renderMovieCollection()
                : renderComingSoon()}

            {showMovieForm && (
                <MovieForm
                    onSubmit={handleAddMovie}
                    onClose={() => setShowMovieForm(false)}
                    isSaving={isSaving}
                />
            )}

            {editingMovie && (
                <MovieForm
                    movie={editingMovie}
                    onSubmit={handleUpdateMovie}
                    onClose={() => setEditingMovie(null)}
                    isSaving={isSaving}
                />
            )}

            {selectedMovie && (
                <WatchedForm
                    movie={selectedMovie}
                    onSubmit={handleMarkWatched}
                    onClose={() => setSelectedMovie(null)}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}

export default Watchlist;