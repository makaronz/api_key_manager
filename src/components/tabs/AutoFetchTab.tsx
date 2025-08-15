import React, { useState } from 'react';
import { Download, ExternalLink, AlertTriangle, Info, Lock, Eye, EyeOff } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { AutoFetchCredentials } from '../../types';

export const AutoFetchTab: React.FC = () => {
  const [credentials, setCredentials] = useState<AutoFetchCredentials>({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isDemo] = useState(true);
  
  const { showWarning, showInfo } = useUiStore();

  const supportedServices = [
    { id: 'openai', name: 'OpenAI', status: 'demo' },
    { id: 'github', name: 'GitHub', status: 'demo' },
    { id: 'stripe', name: 'Stripe', status: 'demo' },
    { id: 'aws', name: 'AWS', status: 'coming-soon' },
    { id: 'google-cloud', name: 'Google Cloud', status: 'coming-soon' },
  ];

  const handleCredentialChange = (field: keyof AutoFetchCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoFetch = () => {
    if (!selectedService) {
      showWarning('Please select a service first');
      return;
    }

    if (!credentials.email || !credentials.password) {
      showWarning('Please enter your credentials');
      return;
    }

    // Demo mode - show info message
    showInfo('This is a demo feature. Automatic key fetching is not yet implemented.');
  };

  const handleOpenDashboard = (serviceId: string) => {
    const dashboardUrls: Record<string, string> = {
      'openai': 'https://platform.openai.com/api-keys',
      'github': 'https://github.com/settings/tokens',
      'stripe': 'https://dashboard.stripe.com/apikeys',
      'aws': 'https://console.aws.amazon.com/iam/home#/security_credentials',
      'google-cloud': 'https://console.cloud.google.com/apis/credentials'
    };

    const url = dashboardUrls[serviceId];
    if (url && window.electronAPI) {
      window.electronAPI.system.openExternal(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Auto-Fetch API Keys</h2>
        <p className="text-gray-600">
          Automatically retrieve API keys from service dashboards using your login credentials.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-900 mb-1">Demo Mode</h4>
            <p className="text-sm text-amber-800">
              This feature is currently in demo mode. Automatic key fetching is not yet implemented. 
              Use the manual links to access service dashboards and copy your API keys manually.
            </p>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportedServices.map(service => (
            <div
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedService === service.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {service.status === 'demo' ? (
                      <span className="badge badge-warning">Demo</span>
                    ) : (
                      <span className="badge badge-gray">Coming Soon</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDashboard(service.id);
                  }}
                  className="btn btn-ghost btn-sm"
                  title="Open dashboard"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials Form */}
      {selectedService && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Credentials</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleCredentialChange('email', e.target.value)}
                className="input w-full"
                placeholder="Enter your email address"
                disabled={isDemo}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password || ''}
                  onChange={(e) => handleCredentialChange('password', e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
                  disabled={isDemo}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isDemo}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Two-Factor Authentication Code (if enabled)
              </label>
              <input
                type="text"
                value={credentials.twoFactorCode || ''}
                onChange={(e) => handleCredentialChange('twoFactorCode', e.target.value)}
                className="input w-full"
                placeholder="Enter 2FA code"
                disabled={isDemo}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleAutoFetch}
              disabled={isDemo}
              className="btn btn-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Fetch API Key
            </button>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Security & Privacy</h4>
            <p className="text-sm text-blue-800 mb-2">
              When this feature is implemented, your credentials will be:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Used only for the duration of the key retrieval process</li>
              <li>• Never stored permanently on your device</li>
              <li>• Transmitted securely using encrypted connections</li>
              <li>• Processed locally without sending to external servers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Manual Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Manual Key Retrieval</h4>
            <p className="text-sm text-gray-600 mb-2">
              For now, you can manually retrieve your API keys:
            </p>
            <ol className="text-sm text-gray-600 space-y-1 ml-4">
              <li>1. Click the external link button next to any service above</li>
              <li>2. Log in to the service dashboard</li>
              <li>3. Navigate to the API keys section</li>
              <li>4. Copy your API key</li>
              <li>5. Return to the Manage tab and paste it there</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoFetchTab;