import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

interface EditorContextType {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  showLogo: boolean;
  setShowLogo: (value: boolean) => void;
  handleScrollPositionChange: (position: number) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showLogo, setShowLogo] = useState<boolean>(true);

  const handleScrollPositionChange = useCallback((position: number) => {
    // スクロール位置に基づいてロゴの表示/非表示を制御
    const threshold = 500;
    
    if (position < threshold) {
      setShowLogo(false);
    } else {
      setShowLogo(true);
    }
  }, []);

  return (
    <EditorContext.Provider 
      value={{ 
        isEditing, 
        setIsEditing, 
        showLogo, 
        setShowLogo, 
        handleScrollPositionChange 
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}; 