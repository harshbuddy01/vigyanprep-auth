import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TestSelection from './pages/TestSelection';
import PaymentSuccess from './pages/PaymentSuccess';
import ResetPassword from './pages/ResetPassword';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Routes>
      {/* Public: Login / Sign Up */}
      <Route path="/" element={<Login />} />

      {/* Public: Reset Password (from email link) */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected: require valid Supabase session */}
      <Route
        path="/tests"
        element={
          <AuthGuard>
            <TestSelection />
          </AuthGuard>
        }
      />
      <Route
        path="/success"
        element={
          <AuthGuard>
            <PaymentSuccess />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default App;
