/**
 * Intelligent Text Parser Module
 * Automatically extracts API keys, secrets, and environment variables from various text formats
 */

export interface ParsedKey {
  key: string;
  value: string;
  type: 'api_key' | 'token' | 'secret' | 'url' | 'path' | 'other';
  service?: string;
  confidence: number; // 0-1 score indicating confidence in the detection
}

export interface ParseResult {
  keys: ParsedKey[];
  format: 'json' | 'env' | 'plain' | 'unknown';
  totalFound: number;
}

/**
 * Pattern definitions for different types of API keys and secrets
 */
const API_PATTERNS = {
  // Common API key patterns
  GITLAB_TOKEN: {
    pattern: /glpat-[a-zA-Z0-9_-]{20,}/g,
    type: 'token' as const,
    service: 'GitLab',
    confidence: 0.95
  },
  FIGMA_API_KEY: {
    pattern: /figd_[a-zA-Z0-9]{32,}/g,
    type: 'api_key' as const,
    service: 'Figma',
    confidence: 0.95
  },
  SLACK_BOT_TOKEN: {
    pattern: /xoxb-[a-zA-Z0-9-]{10,}/g,
    type: 'token' as const,
    service: 'Slack',
    confidence: 0.95
  },
  AWS_ACCESS_KEY: {
    pattern: /AKIA[0-9A-Z]{16}/g,
    type: 'api_key' as const,
    service: 'AWS',
    confidence: 0.9
  },
  AWS_SECRET_KEY: {
    pattern: /[A-Za-z0-9/+=]{40}/g,
    type: 'secret' as const,
    service: 'AWS',
    confidence: 0.7 // Lower confidence as this pattern is more generic
  },
  GOOGLE_API_KEY: {
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    type: 'api_key' as const,
    service: 'Google',
    confidence: 0.9
  },
  MCPR_TOKEN: {
    pattern: /mcpr_[a-zA-Z0-9_-]{20,}/g,
    type: 'token' as const,
    service: 'MCP Router',
    confidence: 0.95
  },
  // Generic patterns for common key formats
  GENERIC_API_KEY: {
    pattern: /[a-zA-Z0-9]{32,}/g,
    type: 'api_key' as const,
    service: 'generic',
    confidence: 0.3 // Very low confidence for generic pattern
  }
};

/**
 * Key name patterns to identify the type of key based on its name
 */
const KEY_NAME_PATTERNS = {
  API_KEY: /.*api[_-]?key.*/i,
  TOKEN: /.*(token|auth).*/i,
  SECRET: /.*(secret|private).*/i,
  URL: /.*(url|endpoint).*/i,
  PATH: /.*(path|dir).*/i
};

/**
 * Service name mapping based on key names
 */
const SERVICE_MAPPING: Record<string, string> = {
  'GITLAB': 'GitLab',
  'FIGMA': 'Figma',
  'SLACK': 'Slack',
  'AWS': 'AWS',
  'GOOGLE': 'Google Maps',
  'MCPR': 'MCP Router',
  'TODO2': 'Todo2',
  'BINANCE': 'Binance',
  'OPENAI': 'OpenAI'
};

export class TextParser {
  /**
   * Main parsing function that automatically detects format and extracts keys
   */
  public static parse(text: string): ParseResult {
    const format = this.detectFormat(text);
    let keys: ParsedKey[] = [];

    switch (format) {
      case 'json':
        keys = this.parseJSON(text);
        break;
      case 'env':
        keys = this.parseEnv(text);
        break;
      case 'plain':
        keys = this.parsePlainText(text);
        break;
      default:
        // Try all parsing methods and combine results
        keys = [
          ...this.parseJSON(text),
          ...this.parseEnv(text),
          ...this.parsePlainText(text)
        ];
    }

    // Remove duplicates and sort by confidence
    keys = this.deduplicateKeys(keys);
    keys.sort((a, b) => b.confidence - a.confidence);

    return {
      keys,
      format,
      totalFound: keys.length
    };
  }

  /**
   * Detect the format of the input text
   */
  private static detectFormat(text: string): ParseResult['format'] {
    const trimmed = text.trim();
    
    // Check for JSON format
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Not valid JSON, continue checking
      }
    }

    // Check for .env format (KEY=VALUE pattern)
    if (/^[A-Z_][A-Z0-9_]*\s*=\s*.+$/m.test(trimmed)) {
      return 'env';
    }

    return 'plain';
  }

  /**
   * Parse JSON format and extract keys from nested structures
   */
  private static parseJSON(text: string): ParsedKey[] {
    const keys: ParsedKey[] = [];
    
    try {
      const parsed = JSON.parse(text);
      this.extractFromObject(parsed, keys);
    } catch (error) {
      // If JSON parsing fails, try to extract from text using patterns
      return this.parsePlainText(text);
    }

    return keys;
  }

  /**
   * Recursively extract keys from nested objects
   */
  private static extractFromObject(obj: any, keys: ParsedKey[], prefix = ''): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string' && value.length > 0) {
        // Check if this looks like a sensitive value
        const parsedKey = this.analyzeKeyValue(key, value);
        if (parsedKey && this.isSensitiveKey(key, value)) {
          keys.push({
            ...parsedKey,
            key: fullKey
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        this.extractFromObject(value, keys, fullKey);
      }
    }
  }

  /**
   * Parse .env format
   */
  private static parseEnv(text: string): ParsedKey[] {
    const keys: ParsedKey[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          const cleanValue = value.replace(/^["']|["']$/g, ''); // Remove quotes
          
          const parsedKey = this.analyzeKeyValue(key, cleanValue);
          if (parsedKey) {
            keys.push(parsedKey);
          }
        }
      }
    }

    return keys;
  }

  /**
   * Parse plain text using pattern matching
   */
  private static parsePlainText(text: string): ParsedKey[] {
    const keys: ParsedKey[] = [];

    // Apply all patterns to find potential keys
    for (const [patternName, pattern] of Object.entries(API_PATTERNS)) {
      const matches = text.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          keys.push({
            key: `DETECTED_${patternName}`,
            value: match,
            type: pattern.type,
            service: pattern.service,
            confidence: pattern.confidence
          });
        }
      }
    }

    return keys;
  }

  /**
   * Analyze a key-value pair to determine its type and confidence
   */
  private static analyzeKeyValue(key: string, value: string): ParsedKey | null {
    if (!value || value.length < 3) {
      return null;
    }

    // First, try to match against known patterns
    for (const pattern of Object.values(API_PATTERNS)) {
      if (pattern.pattern.test(value)) {
        return {
          key,
          value,
          type: pattern.type,
          service: pattern.service,
          confidence: pattern.confidence
        };
      }
    }

    // Determine type based on key name
    let type: ParsedKey['type'] = 'other';
    let confidence = 0.5;

    if (KEY_NAME_PATTERNS.API_KEY.test(key)) {
      type = 'api_key';
      confidence = 0.8;
    } else if (KEY_NAME_PATTERNS.TOKEN.test(key)) {
      type = 'token';
      confidence = 0.8;
    } else if (KEY_NAME_PATTERNS.SECRET.test(key)) {
      type = 'secret';
      confidence = 0.8;
    } else if (KEY_NAME_PATTERNS.URL.test(key)) {
      type = 'url';
      confidence = 0.9;
    } else if (KEY_NAME_PATTERNS.PATH.test(key)) {
      type = 'path';
      confidence = 0.7;
    }

    // Determine service based on key name
    const service = this.getServiceFromKey(key);

    return {
      key,
      value,
      type,
      service,
      confidence
    };
  }

  /**
   * Check if a key-value pair represents sensitive data
   */
  private static isSensitiveKey(key: string, value: string): boolean {
    // Skip obviously non-sensitive values
    if (value.length < 3 || 
        value === 'true' || 
        value === 'false' || 
        /^\d+$/.test(value) ||
        value.startsWith('http://localhost') ||
        value.includes('example.com')) {
      return false;
    }

    // Check if key name suggests it's sensitive
    const sensitiveKeywords = [
      'key', 'token', 'secret', 'password', 'auth', 'credential',
      'private', 'access', 'api', 'bearer'
    ];

    return sensitiveKeywords.some(keyword => 
      key.toLowerCase().includes(keyword)
    );
  }

  /**
   * Extract service name from key
   */
  private static getServiceFromKey(key: string): string | undefined {
    const upperKey = key.toUpperCase();
    
    for (const [service, displayName] of Object.entries(SERVICE_MAPPING)) {
      if (upperKey.includes(service)) {
        return displayName;
      }
    }

    return undefined;
  }

  /**
   * Remove duplicate keys based on value
   */
  private static deduplicateKeys(keys: ParsedKey[]): ParsedKey[] {
    const seen = new Set<string>();
    const result: ParsedKey[] = [];

    for (const key of keys) {
      const identifier = `${key.value}:${key.type}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        result.push(key);
      }
    }

    return result;
  }

  /**
   * Validate extracted keys using additional heuristics
   */
  public static validateKeys(keys: ParsedKey[]): ParsedKey[] {
    return keys.map(key => {
      let adjustedConfidence = key.confidence;

      // Boost confidence for well-known patterns
      if (key.service && key.confidence > 0.8) {
        adjustedConfidence = Math.min(0.95, adjustedConfidence + 0.1);
      }

      // Reduce confidence for very short values
      if (key.value.length < 10) {
        adjustedConfidence *= 0.7;
      }

      // Boost confidence for longer, complex values
      if (key.value.length > 30 && /[A-Za-z0-9+/=_-]/.test(key.value)) {
        adjustedConfidence = Math.min(0.9, adjustedConfidence + 0.1);
      }

      return {
        ...key,
        confidence: adjustedConfidence
      };
    });
  }
}

/**
 * Utility function for quick parsing
 */
export function parseText(text: string): ParseResult {
  const result = TextParser.parse(text);
  result.keys = TextParser.validateKeys(result.keys);
  return result;
}

/**
 * Export keys to .env format
 */
export function exportToEnv(keys: ParsedKey[]): string {
  return keys
    .filter(key => key.confidence > 0.5) // Only export keys with reasonable confidence
    .map(key => `${key.key}=${key.value}`)
    .join('\n');
}

/**
 * Get statistics about parsed keys
 */
export function getParseStats(result: ParseResult): {
  totalKeys: number;
  byType: Record<string, number>;
  byService: Record<string, number>;
  highConfidence: number;
} {
  const byType: Record<string, number> = {};
  const byService: Record<string, number> = {};
  let highConfidence = 0;

  for (const key of result.keys) {
    byType[key.type] = (byType[key.type] || 0) + 1;
    if (key.service) {
      byService[key.service] = (byService[key.service] || 0) + 1;
    }
    if (key.confidence > 0.7) {
      highConfidence++;
    }
  }

  return {
    totalKeys: result.totalFound,
    byType,
    byService,
    highConfidence
  };
}