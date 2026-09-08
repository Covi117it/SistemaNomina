import { useTauriUpdater } from './hooks/useTauriUpdater';
import { useBackendHealth } from './hooks/useBackendHealth';
import { NavigationProvider } from './context/NavigationContext';
import { AppRouter } from './routes/AppRouter';
import { BackendLoader } from './components/common/BackendLoader';

export function App() {
  useTauriUpdater();
  const { isBackendReady } = useBackendHealth();

  if (!isBackendReady) {
    return <BackendLoader />;
  }

  return (
    <NavigationProvider>
      <AppRouter />
    </NavigationProvider>
  );
}

export default App;