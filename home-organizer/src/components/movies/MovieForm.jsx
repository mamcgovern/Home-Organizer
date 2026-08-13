import { useState } from "react";
import {
    ExternalLink,
    FilePenLine,
    Link,
    LoaderCircle,
    X,
} from "lucide-react";

import { importMovieFromIMDb } from "../../services/tmdbService";

const emptyFormData = {
    title: "",
    releaseYear: "",
    genres: "",
    runtimeMinutes: "",
    streamingServices: "",
    suggestedBy: "",
    priority: "medium",
    notes: "",
    overview: "",
    posterUrl: "",
    imdbId: "",
    tmdbId: null,
};

function createInitialFormData(movie) {
    if (!movie) {
        return emptyFormData;
    }

    return {
        title: movie.title || "",
        releaseYear: movie.releaseYear || "",
        genres: movie.genres?.join(", ") || "",
        runtimeMinutes: movie.runtimeMinutes || "",
        streamingServices:
            movie.streamingServices?.join(", ") || "",
        suggestedBy: movie.suggestedBy || "",
        priority: movie.priority || "medium",
        notes: movie.notes || "",
        overview: movie.overview || "",
        posterUrl: movie.posterUrl || "",
        imdbId: movie.imdbId || "",
        tmdbId: movie.tmdbId || null,
    };
}

function splitCommaSeparatedValues(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function MovieForm({
    movie = null,
    onSubmit,
    onClose,
    isSaving,
}) {
    const isEditing = Boolean(movie);

    const [entryMethod, setEntryMethod] = useState(
        isEditing ? "manual" : null
    );

    const [imdbValue, setImdbValue] = useState("");
    const [importError, setImportError] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    const [formData, setFormData] = useState(() =>
        createInitialFormData(movie)
    );

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    function selectManualEntry() {
        setEntryMethod("manual");
        setImportError("");
    }

    function selectIMDbImport() {
        setEntryMethod("imdb");
        setImportError("");
    }

    async function handleIMDbImport(event) {
        event.preventDefault();

        if (!imdbValue.trim()) {
            setImportError("Paste an IMDb link or title ID first.");
            return;
        }

        try {
            setImportError("");
            setIsImporting(true);

            const importedMovie =
                await importMovieFromIMDb(imdbValue);

            setFormData({
                ...emptyFormData,
                ...importedMovie,
                genres: importedMovie.genres.join(", "),
                streamingServices: "",
            });

            setEntryMethod("manual");
        } catch (error) {
            console.error(error);

            setImportError(
                error.message ||
                "We couldn't import that movie. Please try again."
            );
        } finally {
            setIsImporting(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.title.trim()) {
            return;
        }

        const movieData = {
            title: formData.title,
            releaseYear: formData.releaseYear,
            genres: splitCommaSeparatedValues(formData.genres),
            runtimeMinutes: formData.runtimeMinutes,
            streamingServices: splitCommaSeparatedValues(
                formData.streamingServices
            ),
            suggestedBy: formData.suggestedBy,
            priority: formData.priority,
            notes: formData.notes,
            overview: formData.overview,
            posterUrl: formData.posterUrl,
            imdbId: formData.imdbId,
            tmdbId: formData.tmdbId,
            status: movie?.status || "watchlist",
        };

        await onSubmit(movieData);
    }

    function renderEntryChoice() {
        return (
            <div className="movie-entry-choice">
                <p>How would you like to add this movie?</p>

                <div className="movie-entry-options">
                    <button
                        className="movie-entry-option"
                        type="button"
                        onClick={selectIMDbImport}
                    >
                        <span className="movie-entry-icon">
                            <Link size={24} />
                        </span>

                        <span>
                            <strong>Import from IMDb</strong>
                            <small>
                                Paste an IMDb link to fill in the movie
                                details automatically.
                            </small>
                        </span>
                    </button>

                    <button
                        className="movie-entry-option"
                        type="button"
                        onClick={selectManualEntry}
                    >
                        <span className="movie-entry-icon">
                            <FilePenLine size={24} />
                        </span>

                        <span>
                            <strong>Enter manually</strong>
                            <small>
                                Type the title and other movie details
                                yourself.
                            </small>
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    function renderIMDbImport() {
        return (
            <form
                className="imdb-import-form"
                onSubmit={handleIMDbImport}
            >
                <label className="form-field">
                    <span>IMDb movie link or ID</span>

                    <div className="imdb-input-row">
                        <input
                            type="text"
                            value={imdbValue}
                            onChange={(event) =>
                                setImdbValue(event.target.value)
                            }
                            placeholder="https://www.imdb.com/title/tt0111161/"
                            autoFocus
                            disabled={isImporting}
                        />

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={
                                isImporting || !imdbValue.trim()
                            }
                        >
                            {isImporting ? (
                                <>
                                    <LoaderCircle
                                        className="loading-icon loading-icon--small"
                                        size={17}
                                    />
                                    Importing
                                </>
                            ) : (
                                "Import movie"
                            )}
                        </button>
                    </div>

                    <small>
                        You can paste the complete link or an ID such as
                        tt0111161.
                    </small>
                </label>

                {importError && (
                    <p className="import-error">{importError}</p>
                )}

                <button
                    className="text-button"
                    type="button"
                    onClick={() => {
                        setEntryMethod(null);
                        setImportError("");
                    }}
                    disabled={isImporting}
                >
                    Back to entry options
                </button>
            </form>
        );
    }

    function renderMovieForm() {
        const wasImported = Boolean(formData.imdbId);

        return (
            <form className="movie-form" onSubmit={handleSubmit}>
                {wasImported && (
                    <div className="import-success form-field--full">
                        {formData.posterUrl && (
                            <img
                                src={formData.posterUrl}
                                alt={`${formData.title} poster`}
                            />
                        )}

                        <div>
                            <strong>Movie imported successfully</strong>

                            <p>
                                Review the information below and make any
                                changes before saving.
                            </p>

                            <a
                                href={`https://www.imdb.com/title/${formData.imdbId}/`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View on IMDb
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                )}

                <label className="form-field form-field--full">
                    <span>Movie title *</span>

                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="The Princess Bride"
                        autoFocus={!wasImported}
                        required
                    />
                </label>

                <label className="form-field">
                    <span>Release year</span>

                    <input
                        name="releaseYear"
                        type="number"
                        min="1888"
                        max="2100"
                        value={formData.releaseYear}
                        onChange={handleChange}
                        placeholder="1987"
                    />
                </label>

                <label className="form-field">
                    <span>Runtime in minutes</span>

                    <input
                        name="runtimeMinutes"
                        type="number"
                        min="1"
                        value={formData.runtimeMinutes}
                        onChange={handleChange}
                        placeholder="98"
                    />
                </label>

                <label className="form-field form-field--full">
                    <span>Genres</span>

                    <input
                        name="genres"
                        value={formData.genres}
                        onChange={handleChange}
                        placeholder="Comedy, Romance, Adventure"
                    />

                    <small>
                        Separate multiple genres with commas.
                    </small>
                </label>

                <label className="form-field form-field--full">
                    <span>Where can you watch it?</span>

                    <input
                        name="streamingServices"
                        value={formData.streamingServices}
                        onChange={handleChange}
                        placeholder="Netflix, Max, Peacock"
                    />

                    <small>
                        Separate multiple streaming services with commas.
                    </small>
                </label>

                <label className="form-field">
                    <span>Suggested by</span>

                    <select
                        name="suggestedBy"
                        value={formData.suggestedBy}
                        onChange={handleChange}
                    >
                        <option value="">Select a person</option>
                        <option value="Maddie">Maddie</option>
                        <option value="Nick">Nick</option>
                        <option value="Both">Both</option>
                        <option value="Friend">Someone else</option>
                    </select>
                </label>

                <label className="form-field">
                    <span>Priority</span>

                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </label>

                <label className="form-field form-field--full">
                    <span>Description</span>

                    <textarea
                        name="overview"
                        value={formData.overview}
                        onChange={handleChange}
                        placeholder="A short description of the movie"
                        rows="4"
                    />
                </label>

                <label className="form-field form-field--full">
                    <span>Your notes</span>

                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Why do you want to watch it?"
                        rows="3"
                    />
                </label>

                {!isEditing && !wasImported && (
                    <button
                        className="text-button form-field--full"
                        type="button"
                        onClick={() => setEntryMethod(null)}
                    >
                        Back to entry options
                    </button>
                )}

                <footer className="modal-actions">
                    <button
                        className="secondary-button"
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={isSaving}
                    >
                        {isSaving
                            ? "Saving..."
                            : isEditing
                                ? "Save changes"
                                : "Add movie"}
                    </button>
                </footer>
            </form>
        );
    }

    return (
        <div className="modal-backdrop" role="presentation">
            <section
                className="movie-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="movie-form-title"
            >
                <header className="modal-header">
                    <div>
                        <p className="card-eyebrow">
                            {isEditing ? "Edit movie" : "Watchlist"}
                        </p>

                        <h2 id="movie-form-title">
                            {isEditing ? movie.title : "Add a movie"}
                        </h2>
                    </div>

                    <button
                        className="modal-close"
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={isSaving || isImporting}
                    >
                        <X size={22} />
                    </button>
                </header>

                {!entryMethod && renderEntryChoice()}

                {entryMethod === "imdb" && renderIMDbImport()}

                {entryMethod === "manual" && renderMovieForm()}
            </section>
        </div>
    );
}

export default MovieForm;