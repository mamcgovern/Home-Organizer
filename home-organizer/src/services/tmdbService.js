const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

function createRequestOptions() {
    if (!accessToken) {
        throw new Error(
            "The TMDB access token has not been configured."
        );
    }

    return {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    };
}

async function requestTMDB(path) {
    const response = await fetch(
        `${TMDB_API_URL}${path}`,
        createRequestOptions()
    );

    if (!response.ok) {
        throw new Error(
            `TMDB request failed with status ${response.status}.`
        );
    }

    return response.json();
}

export function extractIMDbId(value) {
    const trimmedValue = value.trim();

    const match = trimmedValue.match(/tt\d{7,}/i);

    if (!match) {
        throw new Error(
            "Enter a valid IMDb movie link or IMDb title ID."
        );
    }

    return match[0].toLowerCase();
}

export async function importMovieFromIMDb(imdbLinkOrId) {
    const imdbId = extractIMDbId(imdbLinkOrId);

    const findResults = await requestTMDB(
        `/find/${imdbId}?external_source=imdb_id`
    );

    const movieMatch = findResults.movie_results?.[0];

    if (!movieMatch) {
        throw new Error(
            "We couldn't find a movie matching that IMDb link."
        );
    }

    const movieDetails = await requestTMDB(
        `/movie/${movieMatch.id}`
    );

    return {
        title: movieDetails.title || "",
        releaseYear: movieDetails.release_date
            ? movieDetails.release_date.slice(0, 4)
            : "",
        genres:
            movieDetails.genres?.map((genre) => genre.name) || [],
        runtimeMinutes: movieDetails.runtime || "",
        streamingServices: [],
        suggestedBy: "",
        priority: "medium",
        notes: "",
        overview: movieDetails.overview || "",
        posterUrl: movieDetails.poster_path
            ? `${TMDB_IMAGE_URL}${movieDetails.poster_path}`
            : "",
        imdbId,
        tmdbId: movieDetails.id,
    };
}