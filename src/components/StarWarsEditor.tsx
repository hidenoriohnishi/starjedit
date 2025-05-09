import React, { useState, useRef } from 'react';
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
  transition: transform 0.5s ease;
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

const StarWarsEditor: React.FC = () => {
  const [text, setText] = useState<string>("# スターウォーズ風テキストエディタ\n\nエディタに文字を入力すると、\nスターウォーズのオープニングのように\n文字が流れていきます。\n\n編集してみてください！");
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleWheel = (e: React.WheelEvent) => {
    setScrollPosition(prev => prev + e.deltaY);
  };

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <EditorContainer onClick={focusTextarea}>
      <StarBackground scrollPosition={scrollPosition} />
      
      <TextContainer onWheel={handleWheel}>
        <HiddenTextarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          spellCheck={false}
        />
        <TextContent scrollPosition={scrollPosition}>
          {text.split('\n').map((line, index) => (
            <div key={index}>{line || ' '}</div>
          ))}
        </TextContent>
      </TextContainer>
    </EditorContainer>
  );
};

export default StarWarsEditor; 