import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateContract from './pages/CreateContract';
import ContractDetails from './pages/ContractDetails';
import SignContract from './pages/SignContract';
import VerifyContract from './pages/VerifyContract';
import { Shield } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  useEffect(() => {
    // ... same code for checking storage and pending signup ...
    if (!isConnected || !address) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        navigate('/');
      }
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (storedUser && storedUser.walletAddress.toLowerCase() === address.toLowerCase()) {
      return; 
    }

    const pendingSignup = JSON.parse(sessionStorage.getItem('pendingSignupTemp') || 'null');
    if (pendingSignup && pendingSignup.address.toLowerCase() === address.toLowerCase()) {
      return; 
    }

    const handleSignIn = async () => {
      try {
        // Enforce Sepolia network before asking for signature
        if (chainId !== sepolia.id) {
          await switchChainAsync({ chainId: sepolia.id });
        }

        const message = `Sign in to Legality with wallet: ${address}\nTimestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const res = await axios.post('http://localhost:5000/api/auth/verify-wallet', {
          address,
          message,
          signature
        });

        if (res.data.exists) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          // Navigate to dashboard only if we were not already somewhere specific like sign-contract
          if (window.location.pathname === '/') {
            navigate('/dashboard');
          }
        } else {
          sessionStorage.setItem('pendingSignupTemp', JSON.stringify({
            address, message, signature
          }));
          navigate('/signup');
        }
      } catch (err) {
        console.error("Signature failed or rejected", err);
        disconnect(); // Force disconnect if they refuse to sign
      }
    };

    handleSignIn();
  }, [isConnected, address, signMessageAsync, disconnect, navigate]);

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <AuthGuard>
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-contract" element={<CreateContract />} />
                <Route path="/contract/:id" element={<ContractDetails />} />
                <Route path="/sign-contract/:id" element={<SignContract />} />
                <Route path="/verify" element={<VerifyContract />} />
              </Routes>
            </main>
          </AuthGuard>

          {/* Footer */}
          <footer className="border-t mt-20" style={{ borderColor: 'var(--footer-border)', background: 'var(--footer-bg)' }}>
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold font-display" style={{ color: 'var(--text-secondary)' }}>Legality</span>
                <span className="text-sm" style={{ color: 'var(--text-dim)' }}>— Blockchain-backed contracts</span>
              </div>
              <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-dim)' }}>
                <Link to="/verify" className="hover:opacity-80 transition-opacity">Verify Document</Link>
                <span>Sepolia Testnet</span>
                <span>EIP-191 Signatures</span>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
