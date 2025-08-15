import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApiKeyStore } from '../../stores/apiKeyStore';
import { useUiStore } from '../../stores/uiStore';


import { apiServices } from '../../data/apiServices';
import { TestResult } from '../../types';

export const TestTab: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testingServices, setTestingServices] = useState<Set<string>>(new Set());
  
  const { keys, testKey } = useApiKeyStore();
  const { showSuccess, showError } = useUiStore();

  const configuredServices = apiServices.filter(service => keys[service.id]?.value);

  const handleTestSingle = async (serviceId: string) => {
    setTestingServices(prev => new Set(prev).add(serviceId));
    
    try {
      const startTime = Date.now();
      const isValid = await testKey(serviceId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const result: TestResult = {
          service: serviceId,
          success: isValid,
          isValid,
          responseTime,
          timestamp: new Date(),
          message: isValid ? 'API key is valid' : 'API key validation failed'
        };
      
      setTestResults(prev => ({ ...prev, [serviceId]: result }));
      
      if (isValid) {
        showSuccess(`${apiServices.find(s => s.id === serviceId)?.name} API key is valid`);
      } else {
        showError(`${apiServices.find(s => s.id === serviceId)?.name} API key is invalid`);
      }
    } catch (error) {
      const result: TestResult = {
          service: serviceId,
          success: false,
          isValid: false,
          responseTime: 0,
          timestamp: new Date(),
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      
      setTestResults(prev => ({ ...prev, [serviceId]: result }));
      showError(`Failed to test ${apiServices.find(s => s.id === serviceId)?.name} API key`);
    } finally {
      setTestingServices(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });
    }
  };

  const handleTestAll = async () => {
    if (configuredServices.length === 0) {
      showError('No API keys configured to test');
      return;
    }

    setIsTestingAll(true);
    const results: Record<string, TestResult> = {};
    
    try {
      // Test all services in parallel with a reasonable concurrency limit
      const batchSize = 3;
      for (let i = 0; i < configuredServices.length; i += batchSize) {
        const batch = configuredServices.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (service) => {
            setTestingServices(prev => new Set(prev).add(service.id));
            
            try {
              const startTime = Date.now();
              const isValid = await testKey(service.id);
              const endTime = Date.now();
              const responseTime = endTime - startTime;
              
              results[service.id] = {
                service: service.id,
                success: isValid,
                message: isValid ? 'API key is valid' : 'API key validation failed',
                responseTime,
                isValid,
                timestamp: new Date()
              };
            } catch (error) {
              results[service.id] = {
                service: service.id,
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                responseTime: 0,
                isValid: false,
                timestamp: new Date()
              };
            } finally {
              setTestingServices(prev => {
                const newSet = new Set(prev);
                newSet.delete(service.id);
                return newSet;
              });
            }
          })
        );
      }
      
      setTestResults(prev => ({ ...prev, ...results }));
      
      const validCount = Object.values(results).filter(r => r.isValid).length;
      const totalCount = Object.keys(results).length;
      
      if (validCount === totalCount) {
        showSuccess(`All ${totalCount} API keys are valid`);
      } else {
        showError(`${validCount}/${totalCount} API keys are valid`);
      }
    } catch (error) {
      showError('Failed to complete batch testing');
    } finally {
      setIsTestingAll(false);
    }
  };

  const getStatusIcon = (result?: TestResult, isTesting?: boolean) => {
    if (isTesting) {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    if (!result) {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
    
    if (result.isValid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (result?: TestResult, isTesting?: boolean) => {
    if (isTesting) return 'Testing...';
    if (!result) return 'Not tested';
    return result.isValid ? 'Valid' : 'Invalid';
  };

  const getStatusColor = (result?: TestResult, isTesting?: boolean) => {
    if (isTesting) return 'text-blue-600';
    if (!result) return 'text-gray-500';
    return result.isValid ? 'text-green-600' : 'text-red-600';
  };

  // Calculate statistics
  const totalTested = Object.keys(testResults).length;
  const validKeys = Object.values(testResults).filter(r => r.isValid).length;
  const invalidKeys = totalTested - validKeys;
  const averageResponseTime = totalTested > 0 
    ? Math.round(Object.values(testResults).reduce((sum, r) => sum + (r.responseTime || 0), 0) / totalTested)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">API Key Testing</h2>
          <button
            onClick={handleTestAll}
            disabled={isTestingAll || configuredServices.length === 0}
            className="btn btn-primary"
          >
            {isTestingAll ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing All...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test All Keys
              </>
            )}
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{configuredServices.length}</div>
            <div className="text-sm text-gray-600">Configured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{validKeys}</div>
            <div className="text-sm text-gray-600">Valid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{invalidKeys}</div>
            <div className="text-sm text-gray-600">Invalid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{averageResponseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {configuredServices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys Configured</h3>
          <p className="text-gray-600 mb-4">
            Configure some API keys in the Manage tab before testing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {configuredServices.map(service => {
            const result = testResults[service.id];
            const isTesting = testingServices.has(service.id);
            
            return (
              <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                      {getStatusIcon(result, isTesting)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-sm font-medium ${getStatusColor(result, isTesting)}`}>
                          {getStatusText(result, isTesting)}
                        </span>
                        {result && (
                          <>
                            <span className="text-sm text-gray-500">
                              Response: {result.responseTime}ms
                            </span>
                            <span className="text-sm text-gray-500">
                              Tested: {result.timestamp?.toLocaleString() || 'Unknown'}
                            </span>
                          </>
                        )}
                      </div>
                      {result?.message && !result.success && (
                        <p className="text-sm text-red-600 mt-1">{result.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTestSingle(service.id)}
                    disabled={isTesting}
                    className="btn btn-outline"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isTesting ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Testing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Testing Information</h4>
            <p className="text-sm text-blue-800">
              API key testing validates your keys by making actual requests to each service's test endpoint. 
              This helps ensure your keys are valid and have the necessary permissions. 
              Response times may vary based on network conditions and service availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTab;