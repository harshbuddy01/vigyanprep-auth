import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TestSelection from './pages/TestSelection';
import PaymentSuccess from './pages/PaymentSuccess';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Routes>
      {/* Public: Login / Sign Up */}
      <Route path="/" element={<Login />} />

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
