import React, { useState, useMemo, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon } from './icons';
import * as prettier from 'prettier/standalone';
import * as parserHtml from 'prettier/plugins/html';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserTypeScript from 'prettier/plugins/typescript';
import * as parserEstree from 'prettier/plugins/estree';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState('');
  const [isFormatting, setIsFormatting] = useState(true);

  const language = useMemo(() => {
    if (!code) return 'text';
    const trimmedCode = code.trim();
    if (trimmedCode.startsWith('<!DOCTYPE html>') || trimmedCode.includes('<html>')) {
        return 'html';
    }
    if (trimmedCode.includes('import React') || trimmedCode.includes('React.FC') || /<\/?[A-Z]/.test(trimmedCode)) {
        return 'tsx';
    }
    return 'javascript';
  }, [code]);

  useEffect(() => {
    const formatCode = async () => {
      if (!code) {
        setFormattedCode('');
        setIsFormatting(false);
        return;
      }

      setIsFormatting(true);
      try {
        let parser: string;
        let plugins: any[];

        switch (language) {
          case 'html':
            parser = 'html';
            plugins = [parserHtml];
            break;
          case 'tsx':
            parser = 'typescript';
            plugins = [parserTypeScript, parserEstree];
            break;
          case 'javascript':
          default:
            parser = 'babel';
            plugins = [parserBabel, parserEstree];
            break;
        }

        const prettyCode = await prettier.format(code, {
          parser: parser,
          plugins: plugins,
          semi: true,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 80,
          tabWidth: 2,
        });
        setFormattedCode(prettyCode);
      } catch (error) {
        console.error('Code formatting failed:', error);
        setFormattedCode(code); // Fallback to original code
      } finally {
        setIsFormatting(false);
      }
    };

    formatCode();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isFormatting) {
    return (
      <div className="relative text-sm bg-luxe-darkest p-4 rounded-md flex items-center justify-center min-h-[200px]">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-luxe-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-luxe-text-secondary">Formatting code...</p>
      </div>
    );
  }

  return (
    <div className="relative text-sm bg-luxe-darkest rounded-xl">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 p-1.5 bg-luxe-border/60 text-luxe-text-secondary rounded-md hover:bg-luxe-border transition-colors"
        aria-label="Copy code"
      >
        {isCopied ? (
          <CheckIcon className="h-5 w-5 text-green-400" />
        ) : (
          <CopyIcon className="h-5 w-5" />
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.75rem',
          backgroundColor: 'transparent',
          padding: '1rem',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit',
            fontSize: 'inherit',
          },
        }}
      >
        {String(formattedCode || '').replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;