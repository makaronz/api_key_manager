import { useState, useEffect } from 'react';
import { Copy, Upload, Download, Trash2, Check, X, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && window.process && window.process.type;
const isWeb = !isElectron;

const API_KEYS = [
  'BINANCE_API_KEY',
  'BINANCE_API_SECRET',
  'BINANCE_TESTNET',
  'BYBIT_API_KEY',
  'BYBIT_API_SECRET',
  'BYBIT_TESTNET',
  'OANDA_API_KEY',
  'OANDA_ACCOUNT_ID',
  'OANDA_ENV',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'OPENROUTER_API_KEY',
  'GITHUB_ACCESS_TOKEN'
];

// Mapowanie kluczy do URL-i gdzie można je pobrać
const KEY_URLS = {
  'BINANCE_API_KEY': {
    url: 'https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072',
    name: 'Binance API Guide',
    description: 'Instrukcje tworzenia API key'
  },
  'BINANCE_API_SECRET': {
    url: 'https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072',
    name: 'Binance API Guide',
    description: 'Secret dla klucza API Binance'
  },
  'BINANCE_TESTNET': {
    url: 'https://testnet.binance.vision/',
    name: 'Binance Testnet',
    description: 'Ustaw na "true" dla testnet'
  },
  'BYBIT_API_KEY': {
    url: 'https://learn.bybit.com/bybit-guide/how-to-create-a-bybit-api-key/',
    name: 'Bybit API Guide',
    description: 'Instrukcje tworzenia API key'
  },
  'BYBIT_API_SECRET': {
    url: 'https://learn.bybit.com/bybit-guide/how-to-create-a-bybit-api-key/',
    name: 'Bybit API Guide',
    description: 'Secret dla klucza API Bybit'
  },
  'BYBIT_TESTNET': {
    url: 'https://testnet.bybit.com/',
    name: 'Bybit Testnet',
    description: 'Ustaw na "true" dla testnet'
  },
  'OANDA_API_KEY': {
    url: 'https://developer.oanda.com/rest-live-v20/development-guide/',
    name: 'Oanda Developer Guide',
    description: 'Instrukcje otrzymania API key'
  },
  'OANDA_ACCOUNT_ID': {
    url: 'https://developer.oanda.com/rest-live-v20/account-ep/',
    name: 'Oanda Account Info',
    description: 'Jak znaleźć Account ID'
  },
  'OANDA_ENV': {
    url: 'https://developer.oanda.com/rest-live-v20/development-guide/',
    name: 'Oanda Environment',
    description: 'Ustaw "practice" lub "live"'
  },
  'OPENAI_API_KEY': {
    url: 'https://platform.openai.com/api-keys',
    name: 'OpenAI API Keys',
    description: 'Utwórz nowy API key'
  },
  'ANTHROPIC_API_KEY': {
    url: 'https://console.anthropic.com/',
    name: 'Anthropic Console',
    description: 'Zaloguj się i idź do API Keys'
  },
  'OPENROUTER_API_KEY': {
    url: 'https://openrouter.ai/keys',
    name: 'OpenRouter API Keys',
    description: 'Utwórz klucz API'
  },
  'GITHUB_ACCESS_TOKEN': {
    url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
    name: 'GitHub Token Guide',
    description: 'Instrukcje tworzenia Personal Access Token'
  }
};

const API_SERVICES = {
  BINANCE: {
    name: 'Binance',
    keys: ['BINANCE_API_KEY', 'BINANCE_API_SECRET', 'BINANCE_TESTNET'],
    testEndpoint: 'https://api.binance.com/api/v3/account',
    loginUrl: 'https://www.binance.com/en/my/settings/api-management'
  },
  BYBIT: {
    name: 'Bybit',
    keys: ['BYBIT_API_KEY', 'BYBIT_API_SECRET', 'BYBIT_TESTNET'],
    testEndpoint: 'https://api.bybit.com/v5/user/query-api',
    loginUrl: 'https://www.bybit.com/app/user/api-management'
  },
  OANDA: {
    name: 'Oanda',
    keys: ['OANDA_API_KEY', 'OANDA_ACCOUNT_ID', 'OANDA_ENV'],
    testEndpoint: 'https://api-fxtrade.oanda.com/v3/accounts',
    loginUrl: 'https://www.oanda.com/account/tpa/personal_token'
  },
  OPENAI: {
    name: 'OpenAI',
    keys: ['OPENAI_API_KEY'],
    testEndpoint: 'https://api.openai.com/v1/models',
    loginUrl: 'https://platform.openai.com/api-keys'
  },
  ANTHROPIC: {
    name: 'Anthropic',
    keys: ['ANTHROPIC_API_KEY'],
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    loginUrl: 'https://console.anthropic.com/settings/keys'
  },
  OPENROUTER: {
    name: 'OpenRouter',
    keys: ['OPENROUTER_API_KEY'],
    testEndpoint: 'https://openrouter.ai/api/v1/models',
    loginUrl: 'https://openrouter.ai/keys'
  },
  GITHUB: {
    name: 'GitHub',
    keys: ['GITHUB_ACCESS_TOKEN'],
    testEndpoint: 'https://api.github.com/user',
    loginUrl: 'https://github.com/settings/tokens'
  }
};

export default function ApiKeyManager() {
  const [keys, setKeys] = useState({});
  const [envText, setEnvText] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [activeTab, setActiveTab] = useState('manage');
  const [keyStatus, setKeyStatus] = useState({});
  const [testingKey, setTestingKey] = useState('');
  const [autoFetchStatus, setAutoFetchStatus] = useState({});
  const [credentials, setCredentials] = useState({});

  // Załaduj klucze z localStorage przy starcie
  useEffect(() => {
    const savedKeys = localStorage.getItem('api-keys');
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error('Error loading saved keys:', e);
      }
    }
  }, []);

  // Zapisz klucze do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('api-keys', JSON.stringify(keys));
  }, [keys]);

  // Testuj klucz API
  const testApiKey = async (service) => {
    const serviceInfo = API_SERVICES[service];
    const requiredKeys = serviceInfo.keys.filter(key => !key.includes('TESTNET') && !key.includes('ENV') && !key.includes('ACCOUNT_ID'));
    const apiKey = keys[requiredKeys[0]];
    
    if (!apiKey) {
      setKeyStatus(prev => ({
        ...prev,
        [service]: { status: 'error', message: 'Brak klucza API' }
      }));
      return;
    }

    setTestingKey(service);
    setKeyStatus(prev => ({
      ...prev,
      [service]: { status: 'testing', message: 'Testowanie...' }
    }));

    try {
      // Symulacja testowania (w prawdziwej aplikacji były by prawdziwe wywołania API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Symulacja różnych wyników
      const success = Math.random() > 0.3; // 70% szans powodzenia
      
      if (success) {
        setKeyStatus(prev => ({
          ...prev,
          [service]: { status: 'valid', message: 'Klucz jest aktywny' }
        }));
      } else {
        setKeyStatus(prev => ({
          ...prev,
          [service]: { status: 'invalid', message: 'Klucz nieważny lub wygasły' }
        }));
      }
    } catch (error) {
      setKeyStatus(prev => ({
        ...prev,
        [service]: { status: 'error', message: 'Błąd połączenia' }
      }));
    } finally {
      setTestingKey('');
    }
  };

  // Symulacja automatycznego pobierania kluczy (DEMO - nie działa naprawdę)
  const simulateAutoFetch = async (service) => {
    const serviceInfo = API_SERVICES[service];
    const creds = credentials[service];
    
    if (!creds?.email || !creds?.password) {
      setAutoFetchStatus(prev => ({
        ...prev,
        [service]: { status: 'error', message: 'Podaj email i hasło' }
      }));
      return;
    }

    setAutoFetchStatus(prev => ({
      ...prev,
      [service]: { status: 'fetching', message: 'Logowanie...' }
    }));

    try {
      // Symulacja procesu logowania
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAutoFetchStatus(prev => ({
        ...prev,
        [service]: { status: 'fetching', message: 'Pobieranie kluczy...' }
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // UWAGA: To jest tylko symulacja! 
      // W rzeczywistości większość serwisów nie pozwala na programatyczne pobieranie kluczy
      const mockApiKey = `${service.toLowerCase()}_demo_${Math.random().toString(36).substring(2, 15)}`;
      const mockSecret = `secret_${Math.random().toString(36).substring(2, 25)}`;
      
      // Dodaj klucze do stanu
      const newKeys = { ...keys };
      serviceInfo.keys.forEach(keyName => {
        if (keyName.includes('API_KEY') || keyName.includes('ACCESS_TOKEN')) {
          newKeys[keyName] = mockApiKey;
        } else if (keyName.includes('SECRET')) {
          newKeys[keyName] = mockSecret;
        } else if (keyName.includes('TESTNET')) {
          newKeys[keyName] = 'true';
        } else if (keyName.includes('ENV')) {
          newKeys[keyName] = 'practice';
        }
      });
      
      setKeys(newKeys);
      
      setAutoFetchStatus(prev => ({
        ...prev,
        [service]: { status: 'success', message: 'Klucze pobrane! (DEMO)' }
      }));
      
      // Wyczyść status po 3 sekundach
      setTimeout(() => {
        setAutoFetchStatus(prev => ({
          ...prev,
          [service]: null
        }));
      }, 3000);
      
    } catch (error) {
      setAutoFetchStatus(prev => ({
        ...prev,
        [service]: { status: 'error', message: 'Błąd podczas pobierania' }
      }));
    }
  };
  const parseEnvFile = () => {
    const lines = envText.split('\n');
    const newKeys = { ...keys };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Usuń cudzysłowy
          const cleanKey = key.trim();
          if (API_KEYS.includes(cleanKey)) {
            newKeys[cleanKey] = value;
          }
        }
      }
    });
    
    setKeys(newKeys);
    setEnvText('');
  };

  // Otwórz link w nowej karcie
  const openLink = (url) => {
    try {
      // Próbuj różne metody otwarcia linku
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Jeśli nie udało się otworzyć, skopiuj URL
        copyUrlToClipboard(url, 'manual');
        alert(`Nie można otworzyć linku automatycznie. URL został skopiowany do schowka:\n${url}`);
      }
    } catch (err) {
      console.error('Failed to open link:', err);
      copyUrlToClipboard(url, 'manual');
      alert(`Nie można otworzyć linku. URL został skopiowany do schowka:\n${url}`);
    }
  };

  // Kopiuj URL do schowka
  const copyUrlToClipboard = async (url, keyName) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(`url_${keyName}`);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Kopiuj do schowka
  const copyToClipboard = async (value, keyName) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Eksportuj wszystkie klucze do formatu .env
  const exportToEnv = () => {
    const envContent = API_KEYS
      .filter(key => keys[key])
      .map(key => `${key}=${keys[key]}`)
      .join('\n');
    
    copyToClipboard(envContent, 'export');
  };

  // Wyczyść wszystkie klucze
  const clearAllKeys = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić wszystkie klucze?')) {
      setKeys({});
    }
  };

  // Aktualizuj pojedynczy klucz
  const updateKey = (keyName, value) => {
    setKeys(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  // Aktualizuj dane logowania dla auto-pobierania
  const updateCredentials = (serviceKey, field, value) => {
    setCredentials(prev => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Key Manager</h1>
          <p className="text-gray-400">Zarządzaj swoimi kluczami API lokalnie i bezpiecznie</p>
          
          {isWeb && (
            <div className="mt-4 bg-blue-900/50 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Wersja Webowa</span>
              </div>
              <p className="text-blue-200 text-sm">
                Używasz wersji webowej aplikacji. Klucze są przechowywane w localStorage przeglądarki. 
                Dla pełnej funkcjonalności z macOS Keychain, pobierz wersję desktopową.
              </p>
            </div>
          )}
        </div>

        {/* Taby */}
        <div className="bg-gray-800 rounded-lg mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Zarządzanie Kluczami
            </button>
            <button
              onClick={() => setActiveTab('auto')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'auto'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Auto Pobieranie (DEMO)
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'test'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Testowanie Kluczy
            </button>
          </div>
        </div>

        {/* Tab: Zarządzanie Kluczami */}
        {activeTab === 'manage' && (
          <>
            {/* Sekcja importu .env */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload size={20} />
                Import z pliku .env
              </h2>
              <textarea
                value={envText}
                onChange={(e) => setEnvText(e.target.value)}
                placeholder="Wklej zawartość pliku .env tutaj...&#10;&#10;Przykład:&#10;BINANCE_API_KEY=your_key_here&#10;BINANCE_API_SECRET=your_secret_here&#10;OPENAI_API_KEY=sk-..."
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={parseEnvFile}
                  disabled={!envText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Parse & Fill
                </button>
                <button
                  onClick={exportToEnv}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export .env
                  {copiedKey === 'export' && <span className="text-green-300">(skopiowane!)</span>}
                </button>
                <button
                  onClick={clearAllKeys}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Wyczyść wszystko
                </button>
              </div>

            {/* Szybki dostęp do wszystkich linków */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">🔗 Szybki dostęp do paneli API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(
                  Object.values(KEY_URLS).reduce((acc, keyInfo) => {
                    if (!acc[keyInfo.name]) {
                      acc[keyInfo.name] = keyInfo;
                    }
                    return acc;
                  }, {})
                ).map(([name, info]) => (
                  <div key={name} className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                    <button
                      onClick={() => openLink(info.url)}
                      className="flex-1 text-left text-blue-400 hover:text-blue-300 font-medium"
                    >
                      {name}
                    </button>
                    <button
                      onClick={() => copyUrlToClipboard(info.url, name)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Kopiuj URL"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Lista kluczy API */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Klucze API</h2>
              <div className="space-y-4">
                {API_KEYS.map(keyName => {
                  const keyInfo = KEY_URLS[keyName];
                  return (
                    <div key={keyName} className="flex items-center gap-3">
                      <div className="w-48 text-sm font-medium text-gray-300 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span>{keyName}</span>
                          {keyInfo && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openLink(keyInfo.url)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title={`Otwórz: ${keyInfo.name}`}
                              >
                                <ExternalLink size={14} />
                              </button>
                              <button
                                onClick={() => copyUrlToClipboard(keyInfo.url, keyName)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                                title="Kopiuj URL"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                        {keyInfo && (
                          <div className="text-xs text-gray-500 mt-1">
                            {keyInfo.description}
                            {copiedKey === `url_${keyName}` && (
                              <span className="text-green-400 ml-2">(URL skopiowany!)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="password"
                          value={keys[keyName] || ''}
                          onChange={(e) => updateKey(keyName, e.target.value)}
                          placeholder="Wprowadź klucz..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        />
                        {keys[keyName] && (
                          <button
                            onClick={() => copyToClipboard(keys[keyName], keyName)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            title="Kopiuj do schowka"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                      {copiedKey === keyName && (
                        <div className="text-green-400 text-sm">
                          Skopiowane!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Tab: Auto Pobieranie */}
        {activeTab === 'auto' && (
          <div className="space-y-6">
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Ważne ograniczenia</span>
              </div>
              <p className="text-yellow-200 text-sm">
                Ta funkcja to tylko demonstracja. W rzeczywistości większość serwisów nie pozwala na programatyczne pobieranie kluczy API ze względów bezpieczeństwa. 
                Binance, OpenAI, GitHub i inne wymagają ręcznego tworzenia kluczy przez web interface.
              </p>
            </div>

            {Object.entries(API_SERVICES).map(([serviceKey, service]) => (
              <div key={serviceKey} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <a
                    href={service.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Otwórz panel API →
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={credentials[serviceKey]?.email || ''}
                    onChange={(e) => updateCredentials(serviceKey, 'email', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Hasło"
                    value={credentials[serviceKey]?.password || ''}
                    onChange={(e) => updateCredentials(serviceKey, 'password', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => simulateAutoFetch(serviceKey)}
                    disabled={autoFetchStatus[serviceKey]?.status === 'fetching'}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {autoFetchStatus[serviceKey]?.status === 'fetching' ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Pobierz (DEMO)
                  </button>
                </div>

                {autoFetchStatus[serviceKey] && (
                  <div className={`text-sm p-2 rounded ${
                    autoFetchStatus[serviceKey].status === 'success' ? 'text-green-400 bg-green-900/30' :
                    autoFetchStatus[serviceKey].status === 'error' ? 'text-red-400 bg-red-900/30' :
                    'text-blue-400 bg-blue-900/30'
                  }`}>
                    {autoFetchStatus[serviceKey].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Testowanie Kluczy */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            {Object.entries(API_SERVICES).map(([serviceKey, service]) => (
              <div key={serviceKey} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <button
                    onClick={() => testApiKey(serviceKey)}
                    disabled={testingKey === serviceKey}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {testingKey === serviceKey ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Testuj API
                  </button>
                </div>

                <div className="text-sm text-gray-400 mb-2">
                  Klucze: {service.keys.join(', ')}
                </div>

                {keyStatus[serviceKey] && (
                  <div className={`flex items-center gap-2 text-sm p-3 rounded ${
                    keyStatus[serviceKey].status === 'valid' ? 'text-green-400 bg-green-900/30' :
                    keyStatus[serviceKey].status === 'invalid' ? 'text-red-400 bg-red-900/30' :
                    keyStatus[serviceKey].status === 'error' ? 'text-red-400 bg-red-900/30' :
                    'text-blue-400 bg-blue-900/30'
                  }`}>
                    {keyStatus[serviceKey].status === 'valid' && <Check size={16} />}
                    {keyStatus[serviceKey].status === 'invalid' && <X size={16} />}
                    {keyStatus[serviceKey].status === 'error' && <X size={16} />}
                    {keyStatus[serviceKey].status === 'testing' && <RefreshCw size={16} className="animate-spin" />}
                    {keyStatus[serviceKey].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Statystyki */}
        <div className="mt-6 text-center text-gray-400">
          <p>
            Wypełnione klucze: {Object.values(keys).filter(Boolean).length} / {API_KEYS.length}
          </p>
          <p className="text-xs mt-2">
            Wszystkie dane są przechowywane lokalnie w Twojej przeglądarce
          </p>
        </div>
      </div>
    </div>
  );
}