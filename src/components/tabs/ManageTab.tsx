import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useApiKeyStore } from '../../stores/apiKeyStore';
import { useUiStore } from '../../stores/uiStore';
import ApiKeyCard from '../ApiKeyCard';

import { apiServices, getAllCategories } from '../../data/apiServices';

export const ManageTab: React.FC = () => {
  const [importContent, setImportContent] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportContent, setExportContent] = useState('');
  
  const { keys, isLoading, loadKeys, importFromEnv, exportToEnv, clearAllKeys } = useApiKeyStore();
  const { 
    searchQuery, 
    selectedCategory, 
    setSearchQuery, 
    setSelectedCategory,
    showSuccess,
    showError
  } = useUiStore();

  const categories = ['all', ...getAllCategories()];

  // Filter services based on search and category
  const filteredServices = useMemo(() => {
    return apiServices.filter(service => {
      const matchesSearch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.keyName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Statistics
  const totalKeys = Object.keys(keys).length;
  const validKeys = Object.values(keys).filter(key => key.isValid === true).length;
  const invalidKeys = Object.values(keys).filter(key => key.isValid === false).length;
  const untestedKeys = Object.values(keys).filter(key => key.isValid === undefined).length;

  const handleImport = async () => {
    if (!importContent.trim()) {
      showError('Please enter .env content to import');
      return;
    }

    try {
      await importFromEnv(importContent);
      setImportContent('');
      setShowImportModal(false);
      showSuccess('API keys imported successfully');
    } catch (error) {
      showError('Failed to import API keys');
    }
  };

  const handleExport = async () => {
    try {
      const content = await exportToEnv();
      setExportContent(content);
      setShowExportModal(true);
    } catch (error) {
      showError('Failed to export API keys');
    }
  };

  const handleCopyExport = async () => {
    try {
      await window.electronAPI.clipboard.writeText(exportContent);
      showSuccess('Exported content copied to clipboard');
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const handleSaveExport = async () => {
    try {
      const result = await window.electronAPI.fs.saveFile({
          content: exportContent,
          defaultPath: '.env'
        });
      
      if (result.success) {
        showSuccess('File saved successfully');
        setShowExportModal(false);
      } else {
        showError(result.error || 'Failed to save file');
      }
    } catch (error) {
      showError('Failed to save file');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all API keys? This action cannot be undone.')) {
      return;
    }

    try {
      await clearAllKeys();
      showSuccess('All API keys cleared successfully');
    } catch (error) {
      showError('Failed to clear API keys');
    }
  };

  const handleRefresh = async () => {
    try {
      await loadKeys();
      showSuccess('API keys refreshed');
    } catch (error) {
      showError('Failed to refresh API keys');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">API Key Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="btn btn-outline"
              disabled={isLoading}
              title="Refresh keys"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-outline"
              title="Import from .env"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="btn btn-outline"
              title="Export to .env"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleClearAll}
              className="btn btn-outline text-red-600 hover:bg-red-50"
              title="Clear all keys"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalKeys}</div>
            <div className="text-sm text-gray-600">Total Keys</div>
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
            <div className="text-2xl font-bold text-gray-400">{untestedKeys}</div>
            <div className="text-sm text-gray-600">Untested</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search API services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input pl-10 pr-8 appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* API Key Cards */}
      <div className="grid gap-6">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No API services found matching your criteria.
          </div>
        ) : (
          filteredServices.map(service => (
            <ApiKeyCard
              key={service.id}
              service={service}
              apiKey={keys[service.id]}
            />
          ))
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">Import from .env File</h3>
            <textarea
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
              placeholder="Paste your .env file content here...\n\nExample:\nOPENAI_API_KEY=sk-...\nGITHUB_TOKEN=ghp_...\nSTRIPE_SECRET_KEY=sk_test_..."
              className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportContent('');
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="btn btn-primary"
                disabled={!importContent.trim()}
              >
                Import Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">Export to .env File</h3>
            <textarea
              value={exportContent}
              readOnly
              className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none bg-gray-50"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={handleCopyExport}
                className="btn btn-outline"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleSaveExport}
                className="btn btn-primary"
              >
                Save to File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTab;