import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import StarBackground from './StarBackground';
import { useThrottledValue } from '../hooks/useThrottledValue';

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
`;

const TextContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 400px;
  display: flex;
  justify-content: center;
`;

const TextContent = styled.div<{ scrollPosition: number }>`
  position: absolute;
  width: 80%;
  max-width: 800px;
  color: #FFE81F;
  font-family: 'Arial', sans-serif;
  transform-origin: 50% 100%;
  transform: rotateX(45deg) translateZ(0);
  text-align: center;
  font-size: 1.5rem;
  line-height: 1.5;
  will-change: transform;
  transform: ${props => `rotateX(45deg) translateY(${props.scrollPosition}px)`};
`;

const HiddenTextarea = styled.textarea`
  position: absolute;
  opacity: 0;
  width: 80%;
  max-width: 800px;
  height: 100%;
  z-index: 10;
  resize: none;
  font-family: 'Arial', sans-serif;
  font-size: 1.5rem;
  line-height: 1.5;
  background: transparent;
  color: #FFE81F;
  border: none;
  outline: none;
`;

// カーソル要素のスタイル
const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: #FFE81F;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
  
  @keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const StarWarsEditor: React.FC = () => {
  const [text, setText] = useState<string>("# スターウォーズ風テキストエディタ\n\nエディタに文字を入力すると、\nスターウォーズのオープニングのように\n文字が流れていきます。\n\n編集してみてください！");
  const [scrollPositionRaw, setScrollPositionRaw] = useState<number>(0);
  // スクロール位置をスロットリングして、パフォーマンスを向上
  const scrollPosition = useThrottledValue(scrollPositionRaw, 16);
  const wheelTimeoutRef = useRef<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(text.length);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  }, []);

  // カーソル位置を更新する関数
  const handleSelection = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0);
    }
  }, []);

  // スクロールイベントを最適化
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // スクロールイベントを間引く
    if (wheelTimeoutRef.current) return;
    
    wheelTimeoutRef.current = window.setTimeout(() => {
      wheelTimeoutRef.current = null;
    }, 10);
    
    setScrollPositionRaw(prev => prev + e.deltaY);
  }, []);

  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      setIsFocused(true);
    }
  }, []);
  
  // フォーカスイベント処理
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // イベントリスナーのクリーンアップ
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  // パフォーマンス向上のためメモ化した行の配列とカーソル表示
  const textLines = React.useMemo(() => {
    // テキストを行に分割
    const lines = text.split('\n');
    
    // カーソル位置を計算
    let currentPos = 0;
    let cursorLine = 0;
    let cursorCol = 0;
    
    // カーソルがある行と列を見つける
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= cursorPosition) {
        cursorLine = i;
        cursorCol = cursorPosition - currentPos;
        break;
      }
      // 改行文字の分も加算
      currentPos += lines[i].length + 1;
    }
    
    // 行ごとにJSX要素を生成
    return lines.map((line, lineIndex) => {
      // カーソルがある行の場合
      if (lineIndex === cursorLine && isFocused) {
        // 行をカーソル位置で分割
        const beforeCursor = line.substring(0, cursorCol);
        const afterCursor = line.substring(cursorCol);
        
        return (
          <div key={lineIndex}>
            {beforeCursor}<Cursor />{afterCursor || ' '}
          </div>
        );
      }
      
      // カーソルがない行
      return <div key={lineIndex}>{line || ' '}</div>;
    });
  }, [text, cursorPosition, isFocused]);

  return (
    <EditorContainer onClick={focusTextarea}>
      <StarBackground scrollPosition={scrollPosition} />
      
      <TextContainer onWheel={handleWheel}>
        <HiddenTextarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onSelect={handleSelection}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck={false}
        />
        <TextContent scrollPosition={scrollPosition}>
          {textLines}
        </TextContent>
      </TextContainer>
    </EditorContainer>
  );
};

export default React.memo(StarWarsEditor); 