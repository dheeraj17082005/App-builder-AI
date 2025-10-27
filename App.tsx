
import React, { useState, useCallback, useEffect } from 'react';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import { generateApp, ApiKeyError } from './services/geminiService';
import { CodeBracketsIcon, KeyIcon, ExternalLinkIcon } from './components/icons';

// A dedicated component to handle the API key selection UI.
const ApiKeySelector: React.FC<{ onKeySelect: () => void; }> = ({ onKeySelect }) => {
  const handleSelectKey = async () => {
    try {
      // @ts-ignore - aistudio is available in the execution environment
      await window.aistudio.openSelectKey();
      onKeySelect();
    } catch (e) {
      console.error("Failed to open API key selection dialog:", e);
    }
  };

  return (
    <div className="bg-luxe-darkest min-h-screen flex items-center justify-center font-sans text-luxe-text-primary p-4">
      <div className="bg-luxe-dark p-8 rounded-xl shadow-2xl border border-luxe-border w-full max-w-md text-center">
        <div className="mx-auto bg-luxe-border rounded-full h-16 w-16 flex items-center justify-center mb-6">
          <KeyIcon className="h-8 w-8 text-luxe-accent" />
        </div>
        <h1 className="text-2xl font-bold text-luxe-text-primary mb-3">API Key Required</h1>
        <p className="text-luxe-text-secondary mb-6">
          To use AppBuilderAI, you need to select a Gemini API key associated with your project.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-luxe-accent text-luxe-darkest font-semibold py-3 px-4 rounded-md hover:bg-luxe-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-luxe-dark focus:ring-luxe-accent transition-all duration-200"
        >
          Select API Key
        </button>
        <p className="mt-6 text-xs text-luxe-text-secondary">
          Use of the Gemini API is subject to billing. 
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-luxe-accent/80 hover:text-luxe-accent underline ml-1 inline-flex items-center gap-1"
          >
            Learn more <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyReady, setIsApiKeyReady] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyReady(hasKey);
      } catch (e) {
        console.error("Could not check for API key via aistudio. Defaulting to false.", e);
        setIsApiKeyReady(false);
      }
    };
    checkApiKey();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await generateApp(prompt, selectedModel);
      setGeneratedContent(response);
    } catch (err) {
      if (err instanceof ApiKeyError) {
        setIsApiKeyReady(false);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, selectedModel]);

  const handleKeySelected = () => {
    setIsApiKeyReady(true);
    setError(null);
  };

  if (isApiKeyReady === null) {
    return (
      <div className="bg-luxe-darkest min-h-screen flex items-center justify-center">
         <svg className="animate-spin h-8 w-8 text-luxe-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!isApiKeyReady) {
    return <ApiKeySelector onKeySelect={handleKeySelected} />;
  }

  return (
    <div className="bg-luxe-darkest min-h-screen font-sans text-luxe-text-primary">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center gap-4 mb-8">
          <CodeBracketsIcon className="h-10 w-10 text-luxe-accent" />
          <div>
            <h1 className="text-3xl font-bold text-luxe-text-primary tracking-wider">AppBuilderAI</h1>
            <p className="text-luxe-text-secondary">Turn your app ideas into code, instantly.</p>
          </div>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex flex-col">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
          <div className="lg:w-2/3 flex flex-col">
             <OutputDisplay
                content={generatedContent}
                isLoading={isLoading}
                error={error}
              />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
