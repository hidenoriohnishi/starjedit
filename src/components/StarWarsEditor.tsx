import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import StarBackground from './StarBackground';

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
`;

const TextContainer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
`;

const TextPanel = styled.div<{ scrollPos: number }>`
  width: min(95vw, 1500px);
  border: 2px solid rgba(255, 232, 31, 0.5);
  background: rgba(0, 0, 0, 0.3);
  transform: 
    rotateX(45deg)
    translateY(${props => props.scrollPos}px);
  transform-style: preserve-3d;
  transform-origin: center bottom;
  transition: transform 0.1s ease-out;
`;

const TextContent = styled.textarea`
  width: 100%;
  min-height: 3em;
  height: auto;
  padding: 1rem;
  background: transparent;
  color: #FFE81F;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Arial', sans-serif;
  font-size: clamp(48px, 4.2vw + 3.6vh, 84px);
  line-height: 1.2;
  text-shadow: 0 0 3›0px rgb(135, 131, 0);
  overflow: hidden;
`;

const StarWarsEditor: React.FC = () => {
  const [text, setText] = useState<string>("# スターウォーズ風テキストエディタ\n\nエディタに文字を入力すると、\nスターウォーズのオープニングのように\n文字が流れていきます。\n\n編集してみてください！");
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリアの高さを自動調整する関数
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  // 初期表示時にも高さを調整
  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScrollPosition(prev => prev - e.deltaY);
  }, []);

  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <EditorContainer onClick={focusTextarea}>
      <StarBackground scrollPosition={scrollPosition} />
      <TextContainer onWheel={handleWheel}>
        <TextPanel scrollPos={scrollPosition}>
          <TextContent
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            spellCheck={false}
          />
        </TextPanel>
      </TextContainer>
    </EditorContainer>
  );
};

export default React.memo(StarWarsEditor); 