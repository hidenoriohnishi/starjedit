import './App.css'
import StarWarsEditor from './components/StarWarsEditor'
import React, { useRef, useEffect, useState, useCallback } from 'react'
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
    </div>
  );
}

export default App;
