import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [code, setCode] = useState('// Write or paste your code here to get an AI review\n\nfunction calculateTotal(items) {\n  let total = 0;\n  for(let i=0; i<=items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}\n');
  const [language, setLanguage] = useState('javascript');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [error, setError] = useState(null);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleReview = async () => {
    if (!code.trim()) return;
    
    setIsReviewing(true);
    setError(null);
    setReviewResult(null);

    try {
      const response = await axios.post('http://localhost:3000/api/review', {
        code,
        language
      });
      setReviewResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "An error occurred while reviewing the code.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header glass-panel">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          AI Code Reviewer
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
           <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                border: '1px solid var(--border-color)', 
                padding: '0.5rem', 
                borderRadius: '8px'
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML/CSS</option>
           </select>
          <button 
            className="action-btn" 
            onClick={handleReview}
            disabled={isReviewing || !code.trim()}
          >
            {isReviewing ? (
              <>
                <div className="spinner"></div>
                Reviewing...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Run Review
              </>
            )}
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="editor-section glass-panel">
          <div className="section-header">
            <span>Editor</span>
          </div>
          <div className="editor-container">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Consolas', monospace",
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on"
              }}
            />
          </div>
        </section>

        <section className="review-section glass-panel">
          <div className="section-header">
            <span>AI Feedback</span>
            {reviewResult && reviewResult.rating && (
              <span style={{
                background: 'var(--accent)', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '12px',
                fontSize: '0.85rem'
              }}>
                Score: {reviewResult.rating}
              </span>
            )}
          </div>
          <div className="review-content custom-scrollbar">
            {error && (
              <div className="issue-card error">
                <div className="issue-header">Error</div>
                <div className="issue-desc">{error}</div>
              </div>
            )}

            {!isReviewing && !reviewResult && !error && (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <h3>Ready to Review</h3>
                <p>Click "Run Review" to analyze your code for bugs, best practices, and performance issues.</p>
              </div>
            )}

            {reviewResult && (
              <div>
                {reviewResult.summary && (
                  <div style={{marginBottom: '2rem'}}>
                    <h3 style={{marginTop: 0}}>Summary</h3>
                    <ReactMarkdown>{reviewResult.summary}</ReactMarkdown>
                  </div>
                )}

                {reviewResult.issues && reviewResult.issues.length > 0 && (
                  <div>
                    <h3>Detailed Feedback</h3>
                    {reviewResult.issues.map((issue, idx) => (
                      <div key={idx} className="issue-card">
                        <div className="issue-header">
                          <span>Issue #{idx + 1}</span>
                          {issue.line && issue.line !== 'N/A' && (
                            <span className="issue-line">Line {issue.line}</span>
                          )}
                        </div>
                        <div className="issue-desc">
                          <ReactMarkdown>{issue.description}</ReactMarkdown>
                        </div>
                        {issue.suggestion && (
                          <div className="issue-suggestion">
                            <strong style={{display: 'block', marginBottom: '0.5rem', color: '#10b981'}}>Suggestion:</strong>
                            <ReactMarkdown>{issue.suggestion}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {reviewResult.issues && reviewResult.issues.length === 0 && (
                  <div className="issue-card success">
                    <div className="issue-header">Great Job!</div>
                    <div className="issue-desc">No significant issues found in your code.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
