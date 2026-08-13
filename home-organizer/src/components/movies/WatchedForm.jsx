import { useState } from "react";
import { X } from "lucide-react";

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function WatchedForm({ movie, onSubmit, onClose, isSaving }) {
    const isEditingWatchedDetails =
        movie.status === "watched" && Boolean(movie.watchedDate);

    const [formData, setFormData] = useState({
        watchedDate: movie.watchedDate || getToday(),
        maddieRating: movie.maddieRating ?? "",
        nickRating: movie.nickRating ?? "",
        notes: movie.notes || "",
        isRewatch: Boolean(movie.isRewatch),
    });

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        await onSubmit(movie.id, formData);
    }

    return (
        <div className="modal-backdrop">
            <section
                className="movie-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="watched-form-title"
            >
                <header className="modal-header">
                    <div>
                        <p className="card-eyebrow">
                            {isEditingWatchedDetails
                                ? "Edit watched details"
                                : "Mark as watched"}
                        </p>

                        <h2 id="watched-form-title">
                            {movie.title}
                        </h2>
                    </div>

                    <button
                        className="modal-close"
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        <X size={22} />
                    </button>
                </header>

                <form className="movie-form" onSubmit={handleSubmit}>
                    <label className="form-field form-field--full">
                        <span>Date watched *</span>

                        <input
                            name="watchedDate"
                            type="date"
                            value={formData.watchedDate}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Maddie’s rating</span>

                        <select
                            name="maddieRating"
                            value={formData.maddieRating}
                            onChange={handleChange}
                        >
                            <option value="">Not rated</option>
                            <option value="1">1 star</option>
                            <option value="2">2 stars</option>
                            <option value="3">3 stars</option>
                            <option value="4">4 stars</option>
                            <option value="5">5 stars</option>
                        </select>
                    </label>

                    <label className="form-field">
                        <span>Nick’s rating</span>

                        <select
                            name="nickRating"
                            value={formData.nickRating}
                            onChange={handleChange}
                        >
                            <option value="">Not rated</option>
                            <option value="1">1 star</option>
                            <option value="2">2 stars</option>
                            <option value="3">3 stars</option>
                            <option value="4">4 stars</option>
                            <option value="5">5 stars</option>
                        </select>
                    </label>

                    <label className="form-field form-field--full">
                        <span>Notes</span>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="What did you think?"
                            rows="4"
                        />
                    </label>

                    <label className="checkbox-field form-field--full">
                        <input
                            name="isRewatch"
                            type="checkbox"
                            checked={formData.isRewatch}
                            onChange={handleChange}
                        />

                        <span>This was a rewatch</span>
                    </label>

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
                                : isEditingWatchedDetails
                                  ? "Save watched details"
                                  : "Mark watched"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default WatchedForm;