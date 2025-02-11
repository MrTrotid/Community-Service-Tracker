import { AppRoutes } from './routes';
import { Navigation } from './components/ui/navigation';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="pt-16">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
