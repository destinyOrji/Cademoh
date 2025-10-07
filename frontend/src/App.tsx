import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './providers/Web3Provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { GamePage } from './pages/GamePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import './styles/GlobalStyles.css';

function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </Router>
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;
