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
  text-align: center;
  font-size: 2.5rem;
  line-height: 1.5;
  will-change: transform;
  transform: ${props => `rotateX(45deg) translateY(${props.scrollPosition}px)`};
  height: 500px; // 固定高さを設定して安定させる
  overflow-y: visible; // コンテンツがはみ出ても表示
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
  font-size: 2.5rem;
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

// 行要素のスタイル（ワードラップに対応）
const LineWrapper = styled.div`
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  position: relative;
  padding: 0 20px; // 両側にパディングを追加して縦線のためのスペースを確保
`;

// 縦線ガイド（右側）
const WidthGuide = styled.div<{ visible: boolean }>`
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: rgba(255, 232, 31, 0.3);
  top: 0;
  right: 20px; // パディングに合わせて調整
  bottom: 0;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: opacity 0.8s ease-out;
`;

// 縦のガイドライン（左側）
const LeftGuide = styled.div<{ visible: boolean }>`
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: rgba(255, 232, 31, 0.3);
  top: 0;
  left: 20px; // パディングに合わせて調整
  bottom: 0;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: opacity 0.8s ease-out;
`;

// テキストコンテンツのコンテナ（高さ固定）
const TextContentInner = styled.div`
  position: relative;
  top: 50%; // 中央に配置
  transform: translateY(-50%); // 中央揃え
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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
    
    // 入力中状態を設定
    setIsTyping(true);
    
    // 前のタイムアウトをクリア
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 入力が停止して一定時間後にガイドを非表示
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 1500); // 1.5秒後に非表示
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
    setIsTyping(true); // フォーカス時にガイドを表示
    
    // 前のタイムアウトをクリア
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // フォーカスから一定時間後にガイドを非表示
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 2000); // 2秒後に非表示
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsTyping(false); // フォーカスを失った時にガイドを非表示
  }, []);

  // イベントリスナーのクリーンアップ
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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
          <LineWrapper key={lineIndex}>
            <LeftGuide visible={isTyping} />
            {beforeCursor}<Cursor />{afterCursor || ' '}
            <WidthGuide visible={isTyping} />
          </LineWrapper>
        );
      }
      
      // カーソルがない行
      return (
        <LineWrapper key={lineIndex}>
          {lineIndex === cursorLine && <LeftGuide visible={isTyping} />}
          {line || ' '}
          {lineIndex === cursorLine && <WidthGuide visible={isTyping} />}
        </LineWrapper>
      );
    });
  }, [text, cursorPosition, isFocused, isTyping]);

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
          <TextContentInner>
            {textLines}
          </TextContentInner>
        </TextContent>
      </TextContainer>
    </EditorContainer>
  );
};

export default React.memo(StarWarsEditor); 