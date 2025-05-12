import './App.css'
import StarWarsEditor from './components/StarWarsEditor'
import { useRef, useEffect, useState, useCallback } from 'react'
import starLogo from './assets/star-jedit-logo.svg'
import { useEditor } from './contexts/EditorContext'

function App() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { showLogo } = useEditor();
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(100);

  const handleScroll = useCallback((e: WheelEvent) => {
    if (!editorRef.current) return;

    // スクロールがロックされている場合、下方向へのスクロールを防止
    if (isScrollLocked && e.deltaY > 0) {
      e.preventDefault();
      return;
    }
  }, [isScrollLocked]);

  useEffect(() => {
    const container = editorRef.current;
    if (!container) return;

    // スクロールの制限のみをここで処理
    container.addEventListener('wheel', handleScroll, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleScroll);
    };
  }, [handleScroll]);

  // スクロール位置の変更を受け取るハンドラー
  const handleScrollPositionChange = (position: number) => {
    setScrollPosition(position);

    // スクロールロックの判定
    if (editorRef.current) {
      const scrollTop = editorRef.current.scrollTop;
      const containerHeight = editorRef.current.clientHeight;
      const contentHeight = editorRef.current.scrollHeight;
      const isScrolledEnough = scrollTop + containerHeight >= contentHeight - 100;
      setIsScrollLocked(isScrolledEnough);
    }
  };

  return (
    <div className="App">
      <div 
        ref={editorRef}
        className="editor-container"
        style={{
          overflowY: isScrollLocked ? 'hidden' : 'auto'
        }}
      >
        <StarWarsEditor 
          initialScrollPosition={scrollPosition} 
          onScrollPositionChange={handleScrollPositionChange}
        />
      </div>
      <div 
        className="logo-container"
        style={{
          opacity: showLogo ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
          pointerEvents: 'none'
        }}
      >
        <img src={starLogo} alt="Star JEdit Logo" className="main-logo" />
      </div>
      <a 
        href="https://github.com/hidenoriohnishi/starjedit" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '32px',
          height: '32px',
          opacity: 0.7,
          transition: 'opacity 0.3s ease',
          cursor: 'pointer',
          zIndex: 1000
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            width: '100%',
            height: '100%',
            color: '#FFE81F'
          }}
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>
  );
}

export default App;
