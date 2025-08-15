import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  Key, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit3
} from 'lucide-react';
import { ApiService, ApiKey } from '../types';
import { useApiKeyStore } from '../stores/apiKeyStore';
import { useUiStore } from '../stores/uiStore';

interface ApiKeyCardProps {
  service: ApiService;
  apiKey?: ApiKey;
}

export const ApiKeyCard: React.FC<ApiKeyCardProps> = ({ service, apiKey }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(apiKey?.value || '');
  const [isTesting, setIsTesting] = useState(false);
  
  const { setKey, deleteKey, testKey } = useApiKeyStore();
  const { showSuccess, showError } = useUiStore();

  const handleSave = async () => {
    if (!editValue.trim()) {
      showError('API key cannot be empty');
      return;
    }

    try {
      await setKey(service.id, editValue.trim());
      setIsEditing(false);
      showSuccess(`${service.name} API key saved successfully`);
    } catch (error) {
      showError(`Failed to save ${service.name} API key`);
    }
  };

  const handleDelete = async () => {
    if (!apiKey) return;
    
    try {
      await deleteKey(service.id);
      showSuccess(`${service.name} API key deleted successfully`);
    } catch (error) {
      showError(`Failed to delete ${service.name} API key`);
    }
  };

  const handleTest = async () => {
    if (!apiKey) return;
    
    setIsTesting(true);
    try {
      const isValid = await testKey(service.id);
      if (isValid) {
        showSuccess(`${service.name} API key is valid`);
      } else {
        showError(`${service.name} API key is invalid`);
      }
    } catch (error) {
      showError(`Failed to test ${service.name} API key`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = async () => {
    if (!apiKey?.value) return;
    
    try {
      await window.electronAPI.clipboard.writeText(apiKey.value);
      showSuccess('API key copied to clipboard');
    } catch (error) {
      showError('Failed to copy API key');
    }
  };

  const handleOpenUrl = async (url: string) => {
    try {
      await window.electronAPI.system.openExternal(url);
    } catch (error) {
      showError('Failed to open URL');
    }
  };

  const getStatusIcon = () => {
    if (!apiKey) return null;
    
    if (apiKey.isValid === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (apiKey.isValid === false) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!apiKey) return 'Not configured';
    
    if (apiKey.isValid === true) {
      return 'Valid';
    } else if (apiKey.isValid === false) {
      return 'Invalid';
    } else {
      return 'Not tested';
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="card-title">{service.name}</h3>
              <p className="card-description">{service.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-gray-600">{getStatusText()}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 pt-0 space-y-4">
        {/* API Key Input/Display */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {service.keyName}
          </label>
          
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type={isVisible ? 'text' : 'password'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="input flex-1"
                placeholder="Enter your API key..."
                autoFocus
              />
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="btn btn-outline"
                title={isVisible ? 'Hide key' : 'Show key'}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={!editValue.trim()}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(apiKey?.value || '');
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="input flex-1 bg-gray-50 font-mono text-sm">
                {apiKey?.value ? (
                  isVisible ? apiKey.value : maskApiKey(apiKey.value)
                ) : (
                  <span className="text-gray-400">No API key configured</span>
                )}
              </div>
              
              {apiKey?.value && (
                <>
                  <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="btn btn-outline"
                    title={isVisible ? 'Hide key' : 'Show key'}
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="btn btn-outline"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditValue(apiKey?.value || '');
                }}
                className="btn btn-outline"
                title="Edit API key"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              {apiKey?.value && (
                <button
                  onClick={handleDelete}
                  className="btn btn-outline text-red-600 hover:bg-red-50"
                  title="Delete API key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenUrl(service.docsUrl)}
              className="btn btn-ghost text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Docs
            </button>
            <button
              onClick={() => handleOpenUrl(service.keyUrl)}
              className="btn btn-ghost text-sm"
            >
              <Key className="w-4 h-4 mr-1" />
              Get Key
            </button>
          </div>
          
          {apiKey?.value && (
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="btn btn-primary text-sm"
            >
              {isTesting ? 'Testing...' : 'Test Key'}
            </button>
          )}
        </div>
        
        {/* Last Tested Info */}
        {apiKey?.lastTested && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Last tested: {apiKey.lastTested.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyCard;