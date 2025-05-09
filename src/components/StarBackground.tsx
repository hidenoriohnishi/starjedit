import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

interface StarBackgroundProps {
  scrollPosition: number;
}

const BackgroundCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  layer: number;
}

const StarBackground: React.FC<StarBackgroundProps> = ({ scrollPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastScrollPositionRef = useRef<number>(scrollPosition);
  const lastTimeRef = useRef<number>(0);
  
  // 星を生成する関数
  const generateStars = (count: number, width: number, height: number): Star[] => {
    const stars: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      // 星を3つのレイヤーに分ける (0: 奥, 1: 中間, 2: 手前)
      const layer = Math.floor(Math.random() * 3);
      
      // レイヤーに応じたサイズと速度を設定
      let size, speed, opacity;
      
      if (layer === 0) { // 奥
        size = Math.random() * 1 + 0.1;
        speed = 0.05 + Math.random() * 0.1;
        opacity = 0.3 + Math.random() * 0.2;
      } else if (layer === 1) { // 中間
        size = Math.random() * 1.5 + 0.5;
        speed = 0.1 + Math.random() * 0.2;
        opacity = 0.5 + Math.random() * 0.3;
      } else { // 手前
        size = Math.random() * 2 + 1;
        speed = 0.2 + Math.random() * 0.3;
        opacity = 0.7 + Math.random() * 0.3;
      }
      
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        opacity,
        speed,
        layer
      });
    }
    
    return stars;
  };
  
  // キャンバスの初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // キャンバスサイズをウィンドウに合わせる
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // 星を生成（画面サイズに応じて数を調整）- 星の数を減らす
      const starCount = Math.min(200, Math.floor((window.innerWidth * window.innerHeight) / 3000));
      starsRef.current = generateStars(starCount, canvas.width, canvas.height);
    };
    
    setCanvasSize();
    
    // リサイズイベントを間引く
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(setCanvasSize, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // 星のアニメーション
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const animate = (timestamp: number) => {
      // フレームレートを制限（60FPSを目標）
      if (timestamp - lastTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = timestamp;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // 背景を黒に
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // スクロール位置の差分を計算
      const scrollDelta = scrollPosition - lastScrollPositionRef.current;
      lastScrollPositionRef.current = scrollPosition;
      
      // 描画の最適化: 一度の描画セットアップで複数の星を描画
      for (let layer = 0; layer < 3; layer++) {
        const layerStars = starsRef.current.filter(star => star.layer === layer);
        const layerMultiplier = layer === 0 ? 0.5 : layer === 1 ? 1 : 2;
        
        for (const star of layerStars) {
          // スクロール位置の変化に応じて星を動かす（逆方向に）
          if (scrollDelta !== 0) {
            star.y -= scrollDelta * 0.03 * layerMultiplier; // マイナスにして逆方向に移動
          }
          
          // 画面外に出た星を下から再登場させる
          if (star.y < -10) {
            star.y = canvas.height + 10;
            star.x = Math.random() * canvas.width;
          } else if (star.y > canvas.height + 10) {
            star.y = -10;
            star.x = Math.random() * canvas.width;
          }
          
          // 星を描画 - 単純な円として描画
          context.beginPath();
          context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          context.closePath();
          
          // グラデーションを使わない単純な描画に変更
          context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          context.fill();
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [scrollPosition]);
  
  return <BackgroundCanvas ref={canvasRef} />;
};

export default React.memo(StarBackground); 