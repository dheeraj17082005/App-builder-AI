
import React, { useState, useCallback } from 'react';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import { generateApp } from './services/geminiService';
import { CodeBracketsIcon } from './components/icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await generateApp(prompt, selectedModel);
      setGeneratedContent(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, selectedModel]);

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