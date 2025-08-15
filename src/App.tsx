import { useEffect } from 'react';
import { useApiKeyStore } from './stores/apiKeyStore';
import { useUiStore } from './stores/uiStore';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ManageTab from './components/tabs/ManageTab';
import AutoFetchTab from './components/tabs/AutoFetchTab';
import TestTab from './components/tabs/TestTab';
import TextParser from './components/TextParser';
import NotificationContainer from './components/NotificationContainer';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loadKeys, isLoading } = useApiKeyStore();
  const { activeTab } = useUiStore();

  useEffect(() => {
    // Load existing keys from Keychain on app start
    loadKeys();
  }, [loadKeys]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'manage':
        return <ManageTab />;
      case 'auto-fetch':
        return <AutoFetchTab />;
      case 'test':
        return <TestTab />;
      case 'parser':
        return <TextParser />;
      default:
        return <ManageTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Key Manager
          </h1>
          <p className="text-gray-600">
            Securely manage your API keys with macOS Keychain integration
          </p>
        </div>

        <TabNavigation />
        
        <div className="mt-8">
          {renderActiveTab()}
        </div>
      </main>

      <NotificationContainer />
    </div>
  );
}

export default App;