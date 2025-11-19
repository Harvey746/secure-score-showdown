import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-cyan-400 mb-4">404</div>
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. Let's get you back to the game!
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
            <Home className="h-4 w-4 mr-2" />
            Back to Game
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;


