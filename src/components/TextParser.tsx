import React, { useState, useCallback } from 'react';
import { Upload, Download, Copy, Eye, EyeOff, AlertCircle, FileText, Key } from 'lucide-react';
import { parseText, exportToEnv, getParseStats, ParseResult, ParsedKey } from '../utils/textParser';
import { useApiKeyStore } from '../stores/apiKeyStore';
import { useUiStore } from '../stores/uiStore';

interface TextParserProps {
  onKeysExtracted?: (keys: ParsedKey[]) => void;
}

export const TextParser: React.FC<TextParserProps> = ({ onKeysExtracted }) => {
  const [inputText, setInputText] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  
  const { addApiKey } = useApiKeyStore();
  const { addNotification } = useUiStore();

  const handleParse = useCallback(async () => {
    if (!inputText.trim()) {
      addNotification({ type: 'error', title: 'Input Error', message: 'Please enter some text to parse' });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = parseText(inputText);
      setParseResult(result);
      
      if (result.totalFound === 0) {
        addNotification({ type: 'warning', title: 'Parse Result', message: 'No API keys or secrets found in the provided text' });
      } else {
        addNotification({ type: 'success', title: 'Parse Success', message: `Found ${result.totalFound} potential keys/secrets` });
        onKeysExtracted?.(result.keys);
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Parse Error', message: 'Error parsing text: ' + (error as Error).message });
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, addNotification, onKeysExtracted]);

  const handleClear = () => {
    setInputText('');
    setParseResult(null);
    setShowValues({});
    setSelectedKeys(new Set());
  };

  const toggleValueVisibility = (keyId: string) => {
    setShowValues(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addNotification({ type: 'success', title: 'Copy Success', message: 'Value copied to clipboard' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Copy Error', message: 'Failed to copy value' });
    }
  };

  const toggleKeySelection = (keyId: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(keyId)) {
      newSelected.delete(keyId);
    } else {
      newSelected.add(keyId);
    }
    setSelectedKeys(newSelected);
  };

  const selectAllKeys = () => {
    if (!parseResult) return;
    const allKeyIds = parseResult.keys.map((_, index) => index.toString());
    setSelectedKeys(new Set(allKeyIds));
  };

  const deselectAllKeys = () => {
    setSelectedKeys(new Set());
  };

  const importSelectedKeys = () => {
    if (!parseResult) return;
    
    const keysToImport = parseResult.keys.filter((_, index) => 
      selectedKeys.has(index.toString())
    );

    // Create mapping from display names to service IDs
    const serviceMapping: Record<string, string> = {
      'OpenAI': 'openai',
      'Anthropic': 'anthropic',
      'GitHub': 'github',
      'GitLab': 'github', // GitLab tokens can be stored as GitHub for now
      'Stripe': 'stripe',
      'Binance': 'binance',
      'Coinbase': 'coinbase',
      'SendGrid': 'sendgrid',
      'Twilio': 'twilio',
      'AWS': 'aws',
      'Google': 'google-cloud',
      'Google Maps': 'google-cloud',
      'Google Cloud': 'google-cloud',
      'Discord': 'discord',
      'Slack': 'slack',
      'Supabase': 'supabase',
      'Figma': 'github', // Figma tokens stored as GitHub for now
      'MCP Router': 'github' // MCP Router tokens stored as GitHub for now
    };

    let importedCount = 0;
    let failedCount = 0;
    
    keysToImport.forEach(key => {
      try {
        // Map service name to service ID
        const displayName = key.service || 'Unknown';
        const serviceId = serviceMapping[displayName];
        
        if (!serviceId) {
          console.warn(`No service mapping found for: ${displayName}`);
          failedCount++;
          return;
        }

        addApiKey({
          service: serviceId,
          value: key.value
        });
        importedCount++;
      } catch (error) {
        console.error('Failed to import key:', key.key, error);
        failedCount++;
      }
    });

    if (importedCount > 0) {
      addNotification({ 
        type: 'success', 
        title: 'Import Success', 
        message: `Successfully imported ${importedCount} keys${failedCount > 0 ? ` (${failedCount} failed)` : ''}` 
      });
    } else {
      addNotification({ 
        type: 'warning', 
        title: 'Import Warning', 
        message: 'No keys were imported. Please check service mappings.' 
      });
    }
    
    setSelectedKeys(new Set());
  };

  const exportToEnvFile = () => {
    if (!parseResult) return;
    
    const selectedKeysData = parseResult.keys.filter((_, index) => 
      selectedKeys.has(index.toString())
    );
    
    if (selectedKeysData.length === 0) {
      addNotification({ type: 'warning', title: 'Export Warning', message: 'Please select keys to export' });
      return;
    }

    const envContent = exportToEnv(selectedKeysData);
    
    // Create and download file
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parsed-keys.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification({ type: 'success', title: 'Export Success', message: 'Keys exported to .env file' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getTypeIcon = (type: ParsedKey['type']) => {
    switch (type) {
      case 'api_key': return <Key className="w-4 h-4" />;
      case 'token': return <Key className="w-4 h-4" />;
      case 'secret': return <AlertCircle className="w-4 h-4" />;
      case 'url': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const stats = parseResult ? getParseStats(parseResult) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Text Parser</h2>
          <p className="text-gray-400 mt-1">
            Automatically extract API keys, tokens, and secrets from various text formats
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Paste your text (JSON, .env, or plain text)
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your JSON configuration, .env file content, or any text containing API keys..."
            className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {inputText.length} characters
            </div>
            <button
              onClick={handleParse}
              disabled={isProcessing || !inputText.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Parse Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {parseResult && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Parse Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{stats?.totalKeys || 0}</div>
                <div className="text-sm text-gray-400">Total Found</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{stats?.highConfidence || 0}</div>
                <div className="text-sm text-gray-400">High Confidence</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{parseResult.format.toUpperCase()}</div>
                <div className="text-sm text-gray-400">Format Detected</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{Object.keys(stats?.byService || {}).length}</div>
                <div className="text-sm text-gray-400">Services</div>
              </div>
            </div>
          </div>

          {/* Keys List */}
          {parseResult.keys.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Extracted Keys</h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllKeys}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllKeys}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    Deselect All
                  </button>
                  {selectedKeys.size > 0 && (
                    <>
                      <button
                        onClick={importSelectedKeys}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Import ({selectedKeys.size})
                      </button>
                      <button
                        onClick={exportToEnvFile}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Export .env
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {parseResult.keys.map((key, index) => {
                  const keyId = index.toString();
                  const isSelected = selectedKeys.has(keyId);
                  const isVisible = showValues[keyId];
                  
                  return (
                    <div
                      key={keyId}
                      className={`bg-gray-900 rounded-lg p-4 border-2 transition-colors ${
                        isSelected ? 'border-blue-500' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleKeySelection(keyId)}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(key.type)}
                              <span className="font-medium text-white">{key.key}</span>
                              {key.service && (
                                <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                                  {key.service}
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded ${getConfidenceColor(key.confidence)} bg-gray-800`}>
                                {getConfidenceLabel(key.confidence)} ({Math.round(key.confidence * 100)}%)
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <code className={`flex-1 px-3 py-2 bg-gray-800 rounded text-sm font-mono ${
                                isVisible ? 'text-white' : 'text-gray-500'
                              }`}>
                                {isVisible ? key.value : '•'.repeat(Math.min(key.value.length, 20))}
                              </code>
                              
                              <button
                                onClick={() => toggleValueVisibility(keyId)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title={isVisible ? 'Hide value' : 'Show value'}
                              >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              
                              <button
                                onClick={() => copyValue(key.value)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Copy value"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-400">
                              Type: {key.type.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextParser;