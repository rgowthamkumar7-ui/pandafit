import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStorage } from './hooks/useStorage';
import { useToday } from './hooks/useToday';
import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';
import { DailyLog } from './pages/DailyLog';
import { Nutrition } from './pages/Nutrition';
import { RoutineTracker } from './pages/RoutineTracker';
import { History } from './pages/History';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  const storage = useStorage();
  const todayHelper = useToday();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-white text-duoGray-700 font-sans relative flex flex-col selection:bg-duo-greenLight selection:text-duo-greenDark">
          {/* Main content container */}
          <main className="flex-1 w-full max-w-md mx-auto transition-all duration-200">
            <Routes>
              <Route
                path="/"
                element={<Dashboard storage={storage} todayHelper={todayHelper} />}
              />
              <Route
                path="/log"
                element={<DailyLog storage={storage} todayHelper={todayHelper} />}
              />
              <Route
                path="/nutrition"
                element={<Nutrition storage={storage} todayHelper={todayHelper} />}
              />
              <Route
                path="/routine"
                element={<RoutineTracker storage={storage} todayHelper={todayHelper} />}
              />
              <Route
                path="/history"
                element={<History storage={storage} todayHelper={todayHelper} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Duolingo Bottom Navigation Bar */}
          <NavBar />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
