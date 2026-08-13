import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const moviesCollection = collection(db, "movies");

export async function getMovies() {
    const moviesQuery = query(
        moviesCollection,
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(moviesQuery);

    return snapshot.docs.map((movieDocument) => ({
        id: movieDocument.id,
        ...movieDocument.data(),
    }));
}

export async function addMovie(movie) {
    const movieData = {
        title: movie.title.trim(),
        releaseYear: movie.releaseYear
            ? Number(movie.releaseYear)
            : null,
        genres: movie.genres ?? [],
        runtimeMinutes: movie.runtimeMinutes
            ? Number(movie.runtimeMinutes)
            : null,
        streamingServices: movie.streamingServices ?? [],
        suggestedBy: movie.suggestedBy || "",
        status: movie.status || "watchlist",
        priority: movie.priority || "medium",
        watchedDate: movie.watchedDate || null,
        maddieRating: movie.maddieRating
            ? Number(movie.maddieRating)
            : null,
        nickRating: movie.nickRating
            ? Number(movie.nickRating)
            : null,
        notes: movie.notes?.trim() || "",
        overview: movie.overview?.trim() || "",
        posterUrl: movie.posterUrl || "",
        imdbId: movie.imdbId || "",
        tmdbId: movie.tmdbId ? Number(movie.tmdbId) : null,
        isRewatch: Boolean(movie.isRewatch),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const movieDocument = await addDoc(
        moviesCollection,
        movieData
    );

    return movieDocument.id;
}

export async function updateMovie(movieId, updates) {
    const movieReference = doc(db, "movies", movieId);

    const movieData = {
        title: updates.title.trim(),
        releaseYear: updates.releaseYear
            ? Number(updates.releaseYear)
            : null,
        genres: updates.genres ?? [],
        runtimeMinutes: updates.runtimeMinutes
            ? Number(updates.runtimeMinutes)
            : null,
        streamingServices: updates.streamingServices ?? [],
        suggestedBy: updates.suggestedBy || "",
        priority: updates.priority || "medium",
        notes: updates.notes?.trim() || "",
        overview: updates.overview?.trim() || "",
        posterUrl: updates.posterUrl || "",
        imdbId: updates.imdbId || "",
        tmdbId: updates.tmdbId ? Number(updates.tmdbId) : null,
        status: updates.status || "watchlist",
        updatedAt: serverTimestamp(),
    };

    await updateDoc(movieReference, movieData);
}

export async function markMovieWatched(movieId, watchedDetails) {
    const movieReference = doc(db, "movies", movieId);

    await updateDoc(movieReference, {
        status: "watched",
        watchedDate: watchedDetails.watchedDate,
        maddieRating: watchedDetails.maddieRating
            ? Number(watchedDetails.maddieRating)
            : null,
        nickRating: watchedDetails.nickRating
            ? Number(watchedDetails.nickRating)
            : null,
        notes: watchedDetails.notes?.trim() || "",
        isRewatch: Boolean(watchedDetails.isRewatch),
        updatedAt: serverTimestamp(),
    });
}

export async function moveMovieToWatchlist(movieId) {
    const movieReference = doc(db, "movies", movieId);

    await updateDoc(movieReference, {
        status: "watchlist",
        watchedDate: null,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteMovie(movieId) {
    const movieReference = doc(db, "movies", movieId);
    await deleteDoc(movieReference);
}