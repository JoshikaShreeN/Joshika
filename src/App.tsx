import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { CreatePost } from './components/CreatePost';
import { Feed } from './components/Feed';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <div className="min-h-screen flex items-center justify-center px-4">
                  <AuthForm />
                </div>
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <div className="max-w-2xl mx-auto px-4 py-8">
                  <CreatePost />
                  <Feed />
                </div>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;