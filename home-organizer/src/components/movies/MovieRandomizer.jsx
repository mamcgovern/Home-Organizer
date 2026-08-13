import { useMemo, useState } from "react";
import {
    Check,
    Clock,
    Film,
    RotateCcw,
    Shuffle,
} from "lucide-react";

const defaultFilters = {
    genre: "all",
    streamingService: "all",
    maximumRuntime: "all",
    decade: "all",
    suggestedBy: "all",
    priority: "all",
};

function formatRuntime(runtimeMinutes) {
    if (!runtimeMinutes) {
        return "Runtime unknown";
    }

    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;

    if (!hours) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
}

function getUniqueValues(movies, field) {
    return [
        ...new Set(
            movies.flatMap((movie) => movie[field] || []).filter(Boolean)
        ),
    ].sort((first, second) => first.localeCompare(second));
}

function getDecades(movies) {
    return [
        ...new Set(
            movies
                .map((movie) => {
                    if (!movie.releaseYear) {
                        return null;
                    }

                    return Math.floor(movie.releaseYear / 10) * 10;
                })
                .filter(Boolean)
        ),
    ].sort((first, second) => second - first);
}

function MovieRandomizer({ movies, onMarkWatched }) {
    const [filters, setFilters] = useState(defaultFilters);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [hasPicked, setHasPicked] = useState(false);

    const genres = useMemo(
        () => getUniqueValues(movies, "genres"),
        [movies]
    );

    const streamingServices = useMemo(
        () => getUniqueValues(movies, "streamingServices"),
        [movies]
    );

    const decades = useMemo(() => getDecades(movies), [movies]);

    const suggestedByOptions = useMemo(() => {
        return [
            ...new Set(
                movies
                    .map((movie) => movie.suggestedBy)
                    .filter(Boolean)
            ),
        ].sort();
    }, [movies]);

    const filteredMovies = useMemo(() => {
        return movies.filter((movie) => {
            if (
                filters.genre !== "all" &&
                !movie.genres?.includes(filters.genre)
            ) {
                return false;
            }

            if (
                filters.streamingService !== "all" &&
                !movie.streamingServices?.includes(
                    filters.streamingService
                )
            ) {
                return false;
            }

            if (
                filters.maximumRuntime !== "all" &&
                (!movie.runtimeMinutes ||
                    movie.runtimeMinutes >
                        Number(filters.maximumRuntime))
            ) {
                return false;
            }

            if (filters.decade !== "all") {
                const decade = Number(filters.decade);

                if (
                    !movie.releaseYear ||
                    movie.releaseYear < decade ||
                    movie.releaseYear > decade + 9
                ) {
                    return false;
                }
            }

            if (
                filters.suggestedBy !== "all" &&
                movie.suggestedBy !== filters.suggestedBy
            ) {
                return false;
            }

            if (
                filters.priority !== "all" &&
                movie.priority !== filters.priority
            ) {
                return false;
            }

            return true;
        });
    }, [movies, filters]);

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));

        setSelectedMovie(null);
        setHasPicked(false);
    }

    function pickRandomMovie() {
        if (!filteredMovies.length) {
            setSelectedMovie(null);
            setHasPicked(true);
            return;
        }

        let availableMovies = filteredMovies;

        if (selectedMovie && filteredMovies.length > 1) {
            availableMovies = filteredMovies.filter(
                (movie) => movie.id !== selectedMovie.id
            );
        }

        const randomIndex = Math.floor(
            Math.random() * availableMovies.length
        );

        setSelectedMovie(availableMovies[randomIndex]);
        setHasPicked(true);
    }

    function clearFilters() {
        setFilters(defaultFilters);
        setSelectedMovie(null);
        setHasPicked(false);
    }

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== "all"
    );

    return (
        <div className="randomizer-layout">
            <aside className="randomizer-filters">
                <div className="randomizer-filter-header">
                    <div>
                        <p className="card-eyebrow">Optional</p>
                        <h3>Filter your choices</h3>
                    </div>

                    {hasActiveFilters && (
                        <button
                            className="text-button"
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="randomizer-filter-fields">
                    <label className="form-field">
                        <span>Genre</span>

                        <select
                            name="genre"
                            value={filters.genre}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Any genre</option>

                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span>Streaming service</span>

                        <select
                            name="streamingService"
                            value={filters.streamingService}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Any service</option>

                            {streamingServices.map((service) => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span>Maximum runtime</span>

                        <select
                            name="maximumRuntime"
                            value={filters.maximumRuntime}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Any length</option>
                            <option value="90">90 minutes or less</option>
                            <option value="120">2 hours or less</option>
                            <option value="150">
                                2½ hours or less
                            </option>
                            <option value="180">3 hours or less</option>
                        </select>
                    </label>

                    <label className="form-field">
                        <span>Release decade</span>

                        <select
                            name="decade"
                            value={filters.decade}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Any decade</option>

                            {decades.map((decade) => (
                                <option key={decade} value={decade}>
                                    {decade}s
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span>Suggested by</span>

                        <select
                            name="suggestedBy"
                            value={filters.suggestedBy}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Anyone</option>

                            {suggestedByOptions.map((person) => (
                                <option key={person} value={person}>
                                    {person}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span>Priority</span>

                        <select
                            name="priority"
                            value={filters.priority}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Any priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </label>
                </div>

                <div className="randomizer-match-count">
                    <strong>{filteredMovies.length}</strong>
                    <span>
                        {filteredMovies.length === 1
                            ? " movie matches"
                            : " movies match"}
                    </span>
                </div>

                <button
                    className="primary-button randomizer-pick-button"
                    type="button"
                    onClick={pickRandomMovie}
                    disabled={!filteredMovies.length}
                >
                    <Shuffle size={18} />
                    Pick a movie
                </button>
            </aside>

            <section className="randomizer-result">
                {!hasPicked ? (
                    <div className="randomizer-empty">
                        <div className="movie-state-icon">
                            <Shuffle size={34} />
                        </div>

                        <h3>Let fate choose</h3>

                        <p>
                            Add any filters you want, then select “Pick a
                            movie.”
                        </p>
                    </div>
                ) : !selectedMovie ? (
                    <div className="randomizer-empty">
                        <div className="movie-state-icon">
                            <Film size={34} />
                        </div>

                        <h3>No matching movies</h3>

                        <p>
                            Clear or change some filters to include more
                            choices.
                        </p>

                        <button
                            className="secondary-button"
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <article className="random-movie-result">
                        <div className="random-movie-poster">
                            {selectedMovie.posterUrl ? (
                                <img
                                    src={selectedMovie.posterUrl}
                                    alt={`${selectedMovie.title} poster`}
                                />
                            ) : (
                                <Film size={48} />
                            )}
                        </div>

                        <div className="random-movie-content">
                            <p className="card-eyebrow">
                                Tonight’s movie
                            </p>

                            <h3>{selectedMovie.title}</h3>

                            <div className="random-movie-meta">
                                <span>
                                    {selectedMovie.releaseYear ||
                                        "Year unknown"}
                                </span>

                                <span>
                                    <Clock size={15} />
                                    {formatRuntime(
                                        selectedMovie.runtimeMinutes
                                    )}
                                </span>
                            </div>

                            {selectedMovie.genres?.length > 0 && (
                                <div className="movie-tags">
                                    {selectedMovie.genres.map((genre) => (
                                        <span
                                            className="movie-tag"
                                            key={genre}
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {selectedMovie.overview && (
                                <p className="random-movie-overview">
                                    {selectedMovie.overview}
                                </p>
                            )}

                            {selectedMovie.streamingServices?.length >
                                0 && (
                                <p className="random-movie-service">
                                    <strong>Watch on:</strong>{" "}
                                    {selectedMovie.streamingServices.join(
                                        ", "
                                    )}
                                </p>
                            )}

                            <div className="random-movie-actions">
                                <button
                                    className="primary-button"
                                    type="button"
                                    onClick={() =>
                                        onMarkWatched(selectedMovie)
                                    }
                                >
                                    <Check size={18} />
                                    We watched it
                                </button>

                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={pickRandomMovie}
                                >
                                    <RotateCcw size={17} />
                                    Pick again
                                </button>
                            </div>
                        </div>
                    </article>
                )}
            </section>
        </div>
    );
}

export default MovieRandomizer;