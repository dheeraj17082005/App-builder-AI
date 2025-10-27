
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, MicrophoneIcon } from './icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => void;
  isLoading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, handleSubmit, isLoading, selectedModel, setSelectedModel }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setPrompt(prevPrompt => prevPrompt ? `${prevPrompt.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isSpeechRecognitionSupported, setPrompt]);


  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start speech recognition:", e);
      }
    }
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSubmit();
    }
  };

  const models = [
    { id: 'gemini-2.5-pro', name: 'Pro', description: 'For complex tasks and higher quality generation.' },
    { id: 'gemini-2.5-flash', name: 'Flash', description: 'For faster generation and simpler tasks.' }
  ];
    
  return (
    <div className="bg-luxe-dark p-6 rounded-xl shadow-2xl border border-luxe-border flex-grow flex flex-col sticky top-8">
      <div className="mb-6">
        <label className="block text-lg font-semibold text-luxe-text-primary mb-3">
          1. Select a model
        </label>
        <div className="grid grid-cols-2 gap-3">
          {models.map(model => (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModel(model.id)}
              disabled={isLoading}
              className={`p-3 rounded-lg text-left transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedModel === model.id 
                  ? 'bg-luxe-accent text-luxe-darkest font-semibold ring-2 ring-offset-2 ring-offset-luxe-dark ring-luxe-accent-hover' 
                  : 'bg-luxe-darkest hover:bg-luxe-border'
              }`}
            >
              <p className="text-base">{model.name}</p>
              <p className={`text-xs ${selectedModel === model.id ? 'text-luxe-darkest/70' : 'text-luxe-text-secondary'}`}>{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <label htmlFor="prompt-input" className="block text-lg font-semibold text-luxe-text-primary mb-3">
          2. Describe your app idea
        </label>
        <p className="text-sm text-luxe-text-secondary mb-4">
          Be as descriptive as you like. For example: "A simple calculator" or "A tic-tac-toe game with a reset button".
        </p>
        <div className="relative w-full flex-grow">
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., A pomodoro timer app"
            className="w-full h-full bg-luxe-darkest border border-luxe-border rounded-md p-3 pr-12 text-luxe-text-primary placeholder-luxe-text-secondary/50 focus:ring-2 focus:ring-luxe-accent focus:outline-none transition duration-200 resize-none"
            disabled={isLoading}
          />
          {isSpeechRecognitionSupported && (
            <button
              type="button"
              onClick={handleToggleListening}
              disabled={isLoading}
              title={isListening ? "Stop listening" : "Use microphone"}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-luxe-darkest focus:ring-luxe-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-luxe-border text-luxe-text-secondary hover:bg-luxe-accent hover:text-luxe-darkest'
              }`}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-4 text-xs text-luxe-text-secondary/80">
          Press <kbd className="font-sans font-semibold border border-luxe-border rounded px-1.5 py-0.5">Ctrl/Cmd + Enter</kbd> to submit.
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-luxe-accent text-luxe-darkest font-semibold py-3 px-4 rounded-md hover:bg-luxe-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-luxe-dark focus:ring-luxe-accent transition-all duration-200 disabled:bg-luxe-border disabled:text-luxe-text-secondary disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-luxe-darkest" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" />
            Generate App
          </>
        )}
      </button>
    </div>
  );
};

export default PromptInput;