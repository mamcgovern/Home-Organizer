import { useMemo } from "react";
import {
    CalendarDays,
    Clock,
    Film,
    History,
    Star,
    Trophy,
} from "lucide-react";

function calculateAverage(values) {
    if (!values.length) {
        return null;
    }

    return (
        values.reduce((total, value) => total + value, 0) /
        values.length
    );
}

function formatHours(totalMinutes) {
    const hours = totalMinutes / 60;

    if (hours < 10) {
        return `${hours.toFixed(1)} hours`;
    }

    return `${Math.round(hours)} hours`;
}

function getWatchedYear(movie) {
    if (!movie.watchedDate) {
        return null;
    }

    return Number(movie.watchedDate.slice(0, 4));
}

function createGenreData(movies) {
    const genreCounts = {};

    movies.forEach((movie) => {
        const genres = movie.genres?.length
            ? movie.genres
            : ["Uncategorized"];

        genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    });

    return Object.entries(genreCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((first, second) => {
            if (second.count !== first.count) {
                return second.count - first.count;
            }

            return first.label.localeCompare(second.label);
        });
}

function createDecadeData(movies) {
    const decadeCounts = {};

    movies.forEach((movie) => {
        if (!movie.releaseYear) {
            return;
        }

        const decade =
            Math.floor(Number(movie.releaseYear) / 10) * 10;

        const label = `${decade}s`;

        decadeCounts[label] = (decadeCounts[label] || 0) + 1;
    });

    return Object.entries(decadeCounts)
        .map(([label, count]) => ({
            label,
            count,
            decade: Number(label.replace("s", "")),
        }))
        .sort((first, second) => first.decade - second.decade);
}

function StatsBarChart({ data, emptyMessage }) {
    if (!data.length) {
        return <p className="stats-empty-message">{emptyMessage}</p>;
    }

    const largestValue = Math.max(
        ...data.map((item) => item.count),
        1
    );

    return (
        <div className="stats-bars">
            {data.map((item) => {
                const percentage =
                    (item.count / largestValue) * 100;

                return (
                    <div className="stats-bar-row" key={item.label}>
                        <span className="stats-bar-label">
                            {item.label}
                        </span>

                        <div className="stats-bar-track">
                            <div
                                className="stats-bar-fill"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        <strong>{item.count}</strong>
                    </div>
                );
            })}
        </div>
    );
}

function MovieStats({ movies }) {
    const stats = useMemo(() => {
        const currentYear = new Date().getFullYear();

        const totalMinutes = movies.reduce(
            (total, movie) =>
                total + Number(movie.runtimeMinutes || 0),
            0
        );

        const moviesThisYear = movies.filter(
            (movie) => getWatchedYear(movie) === currentYear
        ).length;

        const releaseYears = movies
            .map((movie) => Number(movie.releaseYear))
            .filter(Boolean);

        const movieAges = movies
            .map((movie) => {
                const watchedYear = getWatchedYear(movie);
                const releaseYear = Number(movie.releaseYear);

                if (!watchedYear || !releaseYear) {
                    return null;
                }

                return Math.max(watchedYear - releaseYear, 0);
            })
            .filter((age) => age !== null);

        const maddieRatings = movies
            .map((movie) => Number(movie.maddieRating))
            .filter(Boolean);

        const nickRatings = movies
            .map((movie) => Number(movie.nickRating))
            .filter(Boolean);

        const combinedRatings = [
            ...maddieRatings,
            ...nickRatings,
        ];

        const genreData = createGenreData(movies);
        const decadeData = createDecadeData(movies);

        return {
            currentYear,
            totalMinutes,
            moviesThisYear,
            averageReleaseYear: calculateAverage(releaseYears),
            averageMovieAge: calculateAverage(movieAges),
            averageMaddieRating: calculateAverage(maddieRatings),
            averageNickRating: calculateAverage(nickRatings),
            averageCombinedRating:
                calculateAverage(combinedRatings),
            genreData,
            decadeData,
            favoriteGenre: genreData[0]?.label || null,
            rewatches: movies.filter((movie) => movie.isRewatch)
                .length,
        };
    }, [movies]);

    if (!movies.length) {
        return (
            <div className="movie-state">
                <div className="movie-state-icon">
                    <Film size={34} />
                </div>

                <h3>No movie statistics yet</h3>

                <p>
                    Mark your first movie as watched to begin building
                    your viewing history.
                </p>
            </div>
        );
    }

    return (
        <div className="movie-stats">
            <section className="movie-stats-summary">
                <article className="movie-stat-card">
                    <div className="movie-stat-icon">
                        <Film size={21} />
                    </div>

                    <div>
                        <p>Total watched</p>
                        <strong>{movies.length}</strong>
                    </div>
                </article>

                <article className="movie-stat-card">
                    <div className="movie-stat-icon">
                        <CalendarDays size={21} />
                    </div>

                    <div>
                        <p>Watched in {stats.currentYear}</p>
                        <strong>{stats.moviesThisYear}</strong>
                    </div>
                </article>

                <article className="movie-stat-card">
                    <div className="movie-stat-icon">
                        <Clock size={21} />
                    </div>

                    <div>
                        <p>Total watch time</p>
                        <strong>
                            {formatHours(stats.totalMinutes)}
                        </strong>
                    </div>
                </article>

                <article className="movie-stat-card">
                    <div className="movie-stat-icon">
                        <History size={21} />
                    </div>

                    <div>
                        <p>Average movie age</p>
                        <strong>
                            {stats.averageMovieAge !== null
                                ? `${stats.averageMovieAge.toFixed(
                                      1
                                  )} years`
                                : "Unknown"}
                        </strong>
                    </div>
                </article>
            </section>

            <section className="movie-stats-grid">
                <article className="stats-panel stats-panel--wide">
                    <header className="stats-panel-header">
                        <div>
                            <p className="card-eyebrow">
                                Viewing history
                            </p>
                            <h3>Movies by genre</h3>
                        </div>

                        <Trophy size={22} />
                    </header>

                    <StatsBarChart
                        data={stats.genreData}
                        emptyMessage="No genre information is available."
                    />
                </article>

                <article className="stats-panel">
                    <header className="stats-panel-header">
                        <div>
                            <p className="card-eyebrow">
                                Your favorites
                            </p>
                            <h3>Average ratings</h3>
                        </div>

                        <Star size={22} />
                    </header>

                    <div className="rating-stats">
                        <div className="rating-stat-row">
                            <span>Maddie</span>
                            <strong>
                                {stats.averageMaddieRating !== null
                                    ? stats.averageMaddieRating.toFixed(
                                          1
                                      )
                                    : "—"}
                            </strong>
                            <small>/ 5</small>
                        </div>

                        <div className="rating-stat-row">
                            <span>Nick</span>
                            <strong>
                                {stats.averageNickRating !== null
                                    ? stats.averageNickRating.toFixed(
                                          1
                                      )
                                    : "—"}
                            </strong>
                            <small>/ 5</small>
                        </div>

                        <div className="rating-stat-row rating-stat-row--combined">
                            <span>Combined</span>
                            <strong>
                                {stats.averageCombinedRating !== null
                                    ? stats.averageCombinedRating.toFixed(
                                          1
                                      )
                                    : "—"}
                            </strong>
                            <small>/ 5</small>
                        </div>
                    </div>
                </article>

                <article className="stats-panel">
                    <header className="stats-panel-header">
                        <div>
                            <p className="card-eyebrow">
                                Release history
                            </p>
                            <h3>Movies by decade</h3>
                        </div>

                        <History size={22} />
                    </header>

                    <StatsBarChart
                        data={stats.decadeData}
                        emptyMessage="No release-year information is available."
                    />
                </article>

                <article className="stats-panel stats-highlights">
                    <header className="stats-panel-header">
                        <div>
                            <p className="card-eyebrow">
                                At a glance
                            </p>
                            <h3>Viewing highlights</h3>
                        </div>
                    </header>

                    <dl className="stats-highlight-list">
                        <div>
                            <dt>Most-watched genre</dt>
                            <dd>{stats.favoriteGenre || "Unknown"}</dd>
                        </div>

                        <div>
                            <dt>Average release year</dt>
                            <dd>
                                {stats.averageReleaseYear !== null
                                    ? Math.round(
                                          stats.averageReleaseYear
                                      )
                                    : "Unknown"}
                            </dd>
                        </div>

                        <div>
                            <dt>First-time watches</dt>
                            <dd>
                                {movies.length - stats.rewatches}
                            </dd>
                        </div>

                        <div>
                            <dt>Rewatches</dt>
                            <dd>{stats.rewatches}</dd>
                        </div>
                    </dl>
                </article>
            </section>
        </div>
    );
}

export default MovieStats;