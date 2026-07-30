import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TestSelection from './pages/TestSelection';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/tests" element={<TestSelection />} />
      <Route path="/success" element={<PaymentSuccess />} />
    </Routes>
  );
}

export default App;
