
import React, { useMemo, useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';
import { AlertTriangleIcon } from './icons';

interface OutputDisplayProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ParsedContent {
  code: string;
  explanation: string;
  howToRun: string;
}

const WelcomeMessage: React.FC = () => (
  <div className="text-center p-8">
    <h2 className="text-2xl font-semibold text-luxe-text-primary mb-2">Welcome to AppBuilderAI</h2>
    <p className="text-luxe-text-secondary">Your generated app code will appear here once you submit an idea.</p>
  </div>
);

const LoadingState: React.FC = () => {
  const [loadingText, setLoadingText] = useState('Analyzing your prompt...');

  useEffect(() => {
    const texts = [
      'Analyzing your prompt...',
      'Consulting with the AI architects...',
      'Generating application code...',
      'Adding explanations...',
      'Finalizing the build...',
    ];
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-6">
          <svg className="animate-spin h-6 w-6 text-luxe-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-luxe-text-primary/80">{loadingText}</p>
      </div>
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
            <div className="h-6 bg-luxe-border rounded w-1/4"></div>
            <div className="h-40 bg-luxe-border rounded"></div>
        </div>
        <div className="space-y-3">
            <div className="h-6 bg-luxe-border rounded w-1/4"></div>
            <div className="h-20 bg-luxe-border rounded"></div>
        </div>
        <div className="space-y-3">
            <div className="h-6 bg-luxe-border rounded w-1/4"></div>
            <div className="h-20 bg-luxe-border rounded"></div>
        </div>
      </div>
    </div>
  );
};

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  let title = "An Unexpected Error Occurred";
  let message = "Something went wrong. Please try submitting your request again. If the problem persists, check the developer console for more details.";

  if (error.toLowerCase().includes('api key')) {
    title = "API Key Configuration Error";
    message = "It seems there's an issue with your Gemini API key. Please ensure it's correctly configured in your environment and has the necessary permissions.";
  } else if (error.toLowerCase().includes('failed to generate')) {
    title = "Generation Failed";
    message = "The AI model was unable to generate a response for your prompt. This could be due to a temporary service issue or a problem with the request. You could try rephrasing your prompt or trying again in a few moments.";
  }

  return (
    <div className="bg-red-950/70 p-4 rounded-lg border border-red-800/60 flex gap-4">
      <div className="flex-shrink-0">
        <AlertTriangleIcon className="h-6 w-6 text-red-500" />
      </div>
      <div>
        <h3 className="font-semibold text-red-400 text-lg mb-1">{title}</h3>
        <p className="text-sm text-red-500 mb-3">{message}</p>
        <details className="group">
          <summary className="text-xs text-red-600 hover:text-red-500 cursor-pointer transition-colors duration-200 group-open:mb-2">
            Show Technical Details
          </summary>
          <pre className="mt-2 text-xs bg-luxe-darkest p-3 rounded-md whitespace-pre-wrap font-mono border border-luxe-border">{error}</pre>
        </details>
      </div>
    </div>
  );
};


type Tab = 'code' | 'preview' | 'explanation' | 'howToRun';

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<Tab>('code');

  const parsedContent = useMemo<ParsedContent | null>(() => {
    if (!content) return null;

    const sections: { [key: string]: string } = {};
    const parts = content.split('### ').slice(1);

    parts.forEach(part => {
      const firstNewline = part.indexOf('\n');
      const title = part.substring(0, firstNewline).trim().toLowerCase();
      let body = part.substring(firstNewline + 1).trim();
      
      if (title === 'code') {
        const codeBlockRegex = /```[\s\S]*?\n([\s\S]+)```/;
        const match = body.match(codeBlockRegex);
        if (match) {
          body = match[1].trim();
        }
      }
      
      if (title === 'code') sections['code'] = body;
      if (title === 'explanation') sections['explanation'] = body;
      if (title.startsWith('how to run')) sections['howToRun'] = body;
    });

    return {
      code: sections['code'] || '',
      explanation: sections['explanation'] || '',
      howToRun: sections['howToRun'] || '',
    };
  }, [content]);

  const isPreviewable = useMemo(() => {
    if (!parsedContent?.code) return false;
    const trimmedCode = parsedContent.code.trim();
    // A simple heuristic to check for HTML code
    return trimmedCode.startsWith('<!DOCTYPE html>') || (trimmedCode.includes('<html>') && !trimmedCode.includes('import React'));
  }, [parsedContent]);

  // Reset to code tab when new content is loaded
  useEffect(() => {
    setActiveTab('code');
  }, [content]);

  const renderTabContent = () => {
    if (!parsedContent) return null;

    switch (activeTab) {
      case 'code':
        return parsedContent.code ? <CodeBlock code={parsedContent.code} /> : <p className="text-luxe-text-secondary">No code generated.</p>;
      case 'preview':
        return isPreviewable ? (
          <div className="w-full h-[60vh] bg-white rounded-md overflow-hidden border border-luxe-border">
            <iframe
              srcDoc={parsedContent.code}
              title="Live Preview"
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        ) : <p className="text-luxe-text-secondary">Preview is not available for this code type.</p>;
      case 'explanation':
        return parsedContent.explanation ? (
          <div className="prose prose-invert prose-p:text-luxe-text-primary/90 prose-li:text-luxe-text-primary/90 text-luxe-text-primary" dangerouslySetInnerHTML={{ __html: parsedContent.explanation.replace(/\n/g, '<br />') }} />
        ) : <p className="text-luxe-text-secondary">No explanation provided.</p>;
      case 'howToRun':
        return parsedContent.howToRun ? (
          <div className="prose prose-invert prose-p:text-luxe-text-primary/90 prose-li:text-luxe-text-primary/90 text-luxe-text-primary" dangerouslySetInnerHTML={{ __html: parsedContent.howToRun.replace(/\n/g, '<br />') }} />
        ) : <p className="text-luxe-text-secondary">No instructions provided.</p>;
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-luxe-dark focus:ring-luxe-accent ${
        activeTab === tab ? 'bg-luxe-accent text-luxe-darkest' : 'text-luxe-text-secondary hover:bg-luxe-border hover:text-luxe-text-primary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-luxe-dark p-6 rounded-xl shadow-2xl border border-luxe-border flex-grow min-h-[calc(100vh-200px)] flex flex-col">
      {isLoading && <LoadingState />}
      {error && <ErrorMessage error={error} />}
      {!isLoading && !error && !content && <WelcomeMessage />}
      {parsedContent && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-luxe-border pb-3 mb-3">
            {parsedContent.code && <TabButton tab="code" label="Code" />}
            {isPreviewable && <TabButton tab="preview" label="Preview" />}
            {parsedContent.explanation && <TabButton tab="explanation" label="Explanation" />}
            {parsedContent.howToRun && <TabButton tab="howToRun" label="How to Run" />}
          </div>
          <div className="flex-grow">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;