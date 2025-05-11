import './App.css'
import StarWarsEditor from './components/StarWarsEditor'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import starLogo from './assets/star-jedit-logo.svg'

function App() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLogo, setShowLogo] = useState(true);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  const checkVisibility = useCallback(() => {
    if (!editorRef.current) return;

    const textContent = editorRef.current.querySelector('textarea');
    if (!textContent) return;

    const textRect = textContent.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollTop = editorRef.current.scrollTop;
    const containerHeight = editorRef.current.clientHeight;
    const contentHeight = textContent.scrollHeight;
    
    // テキストが画面上部に表示されているかチェック
    const isTextNearTop = textRect.top > -100 && textRect.top < viewportHeight * 0.3;
    
    // テキストが画面下部に十分スクロールされているかチェック
    const isScrolledEnough = scrollTop + containerHeight >= contentHeight - 100;

    // スクロールをロックするかどうかの判定
    setIsScrollLocked(isScrolledEnough);
    
    // ロゴの表示条件：
    // テキストが画面上部に表示されていない時のみロゴを表示
    setShowLogo(!isTextNearTop);
  }, []);

  const handleScroll = useCallback((e: WheelEvent) => {
    if (!editorRef.current) return;

    // スクロールがロックされている場合、下方向へのスクロールを防止
    if (isScrollLocked && e.deltaY > 0) {
      e.preventDefault();
      return;
    }

    requestAnimationFrame(checkVisibility);
  }, [checkVisibility, isScrollLocked]);

  useEffect(() => {
    const container = editorRef.current;
    if (!container) return;

    // スクロールとリサイズ時にチェック
    container.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('resize', () => {
      requestAnimationFrame(checkVisibility);
    }, { passive: true });
    
    // 初期チェック
    checkVisibility();

    return () => {
      container.removeEventListener('wheel', handleScroll);
      window.removeEventListener('resize', () => requestAnimationFrame(checkVisibility));
    };
  }, [checkVisibility, handleScroll]);

  return (
    <div className="App">
      <div 
        ref={editorRef}
        className="editor-container"
        style={{
          overflowY: isScrollLocked ? 'hidden' : 'auto'
        }}
      >
        <StarWarsEditor initialScrollPosition={100} />
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
