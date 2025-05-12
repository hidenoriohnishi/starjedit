import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import StarBackground from './StarBackground';
import { FaTrashAlt, FaFileUpload, FaDownload } from 'react-icons/fa';
import { useEditor } from '../contexts/EditorContext';

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
  const { isEditing, setIsEditing, handleScrollPositionChange } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingTimeoutRef = useRef<number | null>(null);
  const isHoveringButtonsRef = useRef<boolean>(false);

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
    setText(savedText || "May the words be with you! A text editor that brings the Force of creativity to your fingertips.\nWrite, edit, and share your stories across the galaxy with Star Jedit—where every keystroke is a step toward the light side of the digital frontier.");
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
    const newText = e.target.value;
    setText(newText);
    setIsEditing(true);
    
    // テキストをローカルストレージに保存
    localStorage.setItem('starwarsText', newText);
    
    // 既存のタイマーをクリア
    if (editingTimeoutRef.current !== null) {
      window.clearTimeout(editingTimeoutRef.current);
    }
    
    // ボタンにマウスが乗っていない場合のみ、タイマーをセット
    if (!isHoveringButtonsRef.current) {
      editingTimeoutRef.current = window.setTimeout(() => {
        setIsEditing(false);
      }, 2000);
    }
  }, [setIsEditing]);

  const handleButtonsMouseEnter = useCallback(() => {
    isHoveringButtonsRef.current = true;
    setIsEditing(true);
    // 既存のタイマーをクリア
    if (editingTimeoutRef.current !== null) {
      window.clearTimeout(editingTimeoutRef.current);
      editingTimeoutRef.current = null;
    }
  }, [setIsEditing]);

  const handleButtonsMouseLeave = useCallback(() => {
    isHoveringButtonsRef.current = false;
    // マウスが離れた後、一定時間後に編集モードを解除
    if (editingTimeoutRef.current !== null) {
      window.clearTimeout(editingTimeoutRef.current);
    }
    editingTimeoutRef.current = window.setTimeout(() => {
      setIsEditing(false);
    }, 2000);
  }, [setIsEditing]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const newPosition = scrollPosition - e.deltaY;
    setScrollPosition(newPosition);
    
    // スクロール位置を親コンポーネントに通知
    if (onScrollPositionChange) {
      onScrollPositionChange(newPosition);
    }
    
    // コンテキストにスクロール位置を通知
    handleScrollPositionChange(newPosition);
  }, [scrollPosition, onScrollPositionChange, handleScrollPositionChange]);

  // タッチイベントのハンドラーを追加
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaY = startY - touch.clientY;
      const newPosition = scrollPosition + deltaY;
      setScrollPosition(newPosition);
      
      if (onScrollPositionChange) {
        onScrollPositionChange(newPosition);
      }
      
      // コンテキストにスクロール位置を通知
      handleScrollPositionChange(newPosition);
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [scrollPosition, onScrollPositionChange, handleScrollPositionChange]);

  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      setIsEditing(true);
      
      // 既存のタイマーをクリア
      if (editingTimeoutRef.current !== null) {
        window.clearTimeout(editingTimeoutRef.current);
      }
      
      // ボタンにマウスが乗っていない場合のみ、タイマーをセット
      if (!isHoveringButtonsRef.current) {
        editingTimeoutRef.current = window.setTimeout(() => {
          setIsEditing(false);
        }, 2000);
      }
    }
  }, [setIsEditing]);

  const handleClear = useCallback(() => {
    setText("");
    // ローカルストレージからテキストを削除
    localStorage.removeItem('starwarsText');
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const handleSave = useCallback(() => {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // 日付ベースのファイル名を生成
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const fileName = `${year}${month}${day}_${hours}${minutes}${seconds}.txt`;
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ファイルの保存中にエラーが発生しました:', error);
      alert('ファイルの保存中にエラーが発生しました。');
    }
  }, [text]);

  const handleLoad = useCallback(() => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // 同じファイルを再度選択できるようにする
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('ファイル選択ダイアログの表示中にエラーが発生しました:', error);
      alert('ファイル選択ダイアログの表示中にエラーが発生しました。');
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 1024 * 1024) { // 1MB以上のファイルは拒否
          alert('ファイルサイズが大きすぎます。1MB以下のファイルを選択してください。');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            if (content) {
              setText(content);
              localStorage.setItem('starwarsText', content);
              adjustTextareaHeight();
            }
          } catch (error) {
            console.error('ファイルの読み込み中にエラーが発生しました:', error);
            alert('ファイルの読み込み中にエラーが発生しました。');
          }
        };
        reader.onerror = () => {
          console.error('ファイルの読み込み中にエラーが発生しました');
          alert('ファイルの読み込み中にエラーが発生しました。');
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('ファイルの処理中にエラーが発生しました:', error);
      alert('ファイルの処理中にエラーが発生しました。');
    }
  }, [adjustTextareaHeight]);

  return (
    <EditorContainer onClick={focusTextarea}>
      <StarBackground scrollPosition={scrollPosition} />
      <ActionButtons 
        isEditing={isEditing}
        onMouseEnter={handleButtonsMouseEnter}
        onMouseLeave={handleButtonsMouseLeave}
      >
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
      <TextContainer 
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
      >
        <TextPanel scrollPos={scrollPosition} isEditing={isEditing}>
          <TextContent
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              if (!isHoveringButtonsRef.current) {
                setIsEditing(false);
              }
            }}
          />
        </TextPanel>
      </TextContainer>
    </EditorContainer>
  );
};

export default React.memo(StarWarsEditor); 