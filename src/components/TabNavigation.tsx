import React from 'react';
import { useUiStore } from '../stores/uiStore';
import { Settings, Download, TestTube, FileText } from 'lucide-react';

type TabType = 'manage' | 'auto-fetch' | 'test' | 'parser';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'manage',
    label: 'Manage',
    icon: Settings,
    description: 'Add, edit, and organize your API keys'
  },
  {
    id: 'auto-fetch',
    label: 'Auto-Fetch',
    icon: Download,
    description: 'Automatically retrieve keys from services'
  },
  {
    id: 'test',
    label: 'Test',
    icon: TestTube,
    description: 'Validate your API keys'
  },
  {
    id: 'parser',
    label: 'Parser',
    icon: FileText,
    description: 'Extract API keys from text and JSON'
  }
];

const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5 transition-colors
                  ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;