import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const validCalendarViews = [
    "list",
    "calendar",
    "countdown",
];

export async function getCalendarViewPreference(userId) {
    if (!userId) {
        return "list";
    }

    const userReference = doc(db, "users", userId);
    const snapshot = await getDoc(userReference);

    if (!snapshot.exists()) {
        return "list";
    }

    const savedView = snapshot.data().calendarView;

    return validCalendarViews.includes(savedView)
        ? savedView
        : "list";
}

export async function saveCalendarViewPreference(
    userId,
    calendarView
) {
    if (
        !userId ||
        !validCalendarViews.includes(calendarView)
    ) {
        return;
    }

    const userReference = doc(db, "users", userId);

    await setDoc(
        userReference,
        {
            calendarView,
            updatedAt: serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}