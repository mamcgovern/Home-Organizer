import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Calendar from "./pages/Calendar";
import Chores from "./pages/Chores";
import Groceries from "./pages/Groceries";
import Home from "./pages/Home";
import Meals from "./pages/Meals";
import Tasks from "./pages/Tasks";
import Watchlist from "./pages/Watchlist";

import { db } from "./firebase/config";

function App() {
  console.log("Firestore connected:", db);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/groceries" element={<Groceries />} />
        <Route path="/chores" element={<Chores />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/watchlist" element={<Watchlist />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;