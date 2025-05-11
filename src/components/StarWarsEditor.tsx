import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import StarBackground from './StarBackground';
import { FaTrashAlt, FaFileUpload, FaDownload } from 'react-icons/fa';

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
`;

const ActionButtons = styled.div<{ isEditing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
  opacity: ${props => props.isEditing ? 1 : 0};
  transition: opacity 0.5s ease-out;
`;

const ActionButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 232, 31, 0.8);
  color: #FFE81F;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  outline: none;

  &:hover, &:focus {
    background: rgba(255, 232, 31, 0.2);
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(255, 232, 31, 0.5);
    border-color: rgba(255, 232, 31, 0.8);
    outline: none;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #FFE81F;
    filter: drop-shadow(0 0 2px rgba(255, 232, 31, 0.5));
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const TextContainer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  perspective: 1000px;
  perspective-origin: center 0%;
  transform-style: preserve-3d;
`;

const TextPanel = styled.div<{ scrollPos: number; isEditing: boolean }>`
  width: min(90vw, 1500px);
  border-left: 2px solid rgba(255, 232, 31, 0.5);
  border-right: 2px solid rgba(255, 232, 31, 0.5);
  background: rgba(0, 0, 0, 0.3);
  transform: 
    rotateX(60deg)
    translateY(calc(${props => props.scrollPos}px + 120vh))
    translateZ(-800px);
  transform-style: preserve-3d;
  transform-origin: center 0;
  transition: transform 0.1s ease-out, border-color 0.5s ease-out;
  border-color: ${props => props.isEditing ? 'rgba(255, 232, 31, 0.5)' : 'rgba(255, 232, 31, 0)'};
  min-height: 200px;
`;

const TextContent = styled.textarea`
  width: 100%;
  min-height: 1.2em;
  padding: 20px;
  background: transparent;
  color: #FFE81F;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Arial', sans-serif;
  font-weight: 700;
  font-size: clamp(48px, 4.2vw + 3.6vh, 84px);
  line-height: 1.2;
  text-shadow: 0 0 30px rgb(135, 131, 0);
  text-align: center;

  &::selection {
    background: rgba(255, 232, 31, 0.1);
    color: #FFE81F;
  }
`;

interface StarWarsEditorProps {
  initialScrollPosition?: number;
  onScrollPositionChange?: (position: number) => void;
}

const StarWarsEditor: React.FC<StarWarsEditorProps> = ({ 
  initialScrollPosition = 100,
  onScrollPositionChange 
}) => {
  const [text, setText] = useState<string>("");
  const [scrollPosition, setScrollPosition] = useState<number>(initialScrollPosition);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingTimeoutRef = useRef<number | null>(null);

  // テキストエリアの高さを自動調整する関数
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // ローカルストレージからテキストを読み込む
  useEffect(() => {
    const savedText = localStorage.getItem('starwarsText');
    setText(savedText || "Star Editor\nverpisode 1");
  }, []);

  // テキストが変更されたときに高さを調整
  useEffect(() => {
    if (text) {
      // テキストが存在する場合、少し遅延させて高さを調整
      const timer = setTimeout(() => {
        adjustTextareaHeight();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [text, adjustTextareaHeight]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsEditing(true);
    
    // 既存のタイマーをクリア
    if (editingTimeoutRef.current !== null) {
      window.clearTimeout(editingTimeoutRef.current);
    }
    
    // 新しいタイマーをセット
    editingTimeoutRef.current = window.setTimeout(() => {
      setIsEditing(false);
    }, 2000);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const newPosition = scrollPosition - e.deltaY;
    setScrollPosition(newPosition);
    
    // スクロール位置を親コンポーネントに通知
    if (onScrollPositionChange) {
      onScrollPositionChange(newPosition);
    }
  }, [scrollPosition, onScrollPositionChange]);

  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      setIsEditing(true);
      
      // 既存のタイマーをクリア
      if (editingTimeoutRef.current !== null) {
        window.clearTimeout(editingTimeoutRef.current);
      }
      
      // 新しいタイマーをセット
      editingTimeoutRef.current = window.setTimeout(() => {
        setIsEditing(false);
      }, 2000);
    }
  }, []);

  const handleClear = useCallback(() => {
    setText("");
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const handleSave = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'starwars-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [text]);

  const handleLoad = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        adjustTextareaHeight();
      };
      reader.readAsText(file);
    }
  }, [adjustTextareaHeight]);

  return (
    <EditorContainer onClick={focusTextarea}>
      <StarBackground scrollPosition={scrollPosition} />
      <ActionButtons isEditing={isEditing}>
        <ActionButton onClick={handleClear} title="クリア">
          <FaTrashAlt />
        </ActionButton>
        <ActionButton onClick={handleLoad} title="ロード">
          <FaFileUpload />
        </ActionButton>
        <ActionButton onClick={handleSave} title="保存">
          <FaDownload />
        </ActionButton>
      </ActionButtons>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileChange}
      />
      <TextContainer onWheel={handleWheel}>
        <TextPanel scrollPos={scrollPosition} isEditing={isEditing}>
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