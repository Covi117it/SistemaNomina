import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useTauriUpdater } from './hooks/useTauriUpdater';
import { useBackendHealth } from './hooks/useBackendHealth';
import { useFastScroll } from './hooks/useFastScroll';
import { NavigationProvider } from './context/NavigationContext';
import { AppRouter } from './routes/AppRouter';
import { BackendLoader } from './components/common/BackendLoader';

export function App() {
  useFastScroll(2.2);
  useTauriUpdater();
  const { isBackendReady, statusMessage, isTimeout, retryConnection } = useBackendHealth();

  useEffect(() => {
    getCurrentWindow().maximize().catch(() => {});
  }, []);

  if (!isBackendReady) {
    return (
      <BackendLoader
        statusMessage={statusMessage}
        isTimeout={isTimeout}
        onRetry={retryConnection}
      />
    );
  }

  return (
    <NavigationProvider>
      <AppRouter />
    </NavigationProvider>
  );
}

export default App;