import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Trophy, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold text-white">Memory Match</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                className={location.pathname === '/' ? 'bg-cyan-600 hover:bg-cyan-700' : 'text-slate-300 hover:text-white'}
              >
                <Home className="h-4 w-4 mr-2" />
                Play Game
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                variant={location.pathname === '/leaderboard' ? 'default' : 'ghost'}
                className={location.pathname === '/leaderboard' ? 'bg-cyan-600 hover:bg-cyan-700' : 'text-slate-300 hover:text-white'}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                          >
                            Connect Rainbow Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            variant="destructive"
                          >
                            Wrong network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex gap-2">
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 8,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 16, height: 16 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          <Button
                            onClick={openAccountModal}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                          >
                            {account.displayName}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  );
};


