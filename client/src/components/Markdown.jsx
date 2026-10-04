import ReactMarkdown from 'react-markdown';

// react-markdown does not render raw HTML and strips unsafe URLs (like javascript:) by default,
// so note content can't inject scripts. Do NOT add rehype-raw here.
export default function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
