import CodeBlock from './CodeBlock';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-sm">
      {parts.map((part, index) => {
        // Check if this part is a code block
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const withoutBackticks = part.slice(3, -3);
          const firstNewline = withoutBackticks.indexOf('\n');
          
          if (firstNewline === -1) {
            // No newline, just language or empty
            return <CodeBlock key={index} language="" code={withoutBackticks} />;
          }
          
          const language = withoutBackticks.slice(0, firstNewline).trim();
          const code = withoutBackticks.slice(firstNewline + 1).trim();
          
          return <CodeBlock key={index} language={language} code={code} />;
        }
        
        // Regular text - preserve whitespace and newlines
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </div>
  );
}
