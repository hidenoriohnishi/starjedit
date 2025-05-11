import React, { useRef, useEffect } from "react"
import styled from "styled-components"

const BackgroundCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  layer: number
}

const LogoStarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])

  // 星を生成する関数
  const generateStars = (count: number, width: number, height: number): Star[] => {
    const stars: Star[] = []

    // 層ごとの星の数を決定
    const bgStarCount = Math.floor(count * 0.5) // 50%は背景の固定星
    const midStarCount = Math.floor(count * 0.3) // 30%は中間層
    const fgStarCount = count - bgStarCount - midStarCount // 残り20%は前景

    // 背景の固定星（レイヤー0）
    for (let i = 0; i < bgStarCount; i++) {
      stars.push(createRandomStar(width, height, 0))
    }
    
    // 中間層の星（レイヤー1）
    for (let i = 0; i < midStarCount; i++) {
      stars.push(createRandomStar(width, height, 1))
    }
    
    // 前景の星（レイヤー2）
    for (let i = 0; i < fgStarCount; i++) {
      stars.push(createRandomStar(width, height, 2))
    }

    return stars
  }

  // ランダムな星を1つ生成する関数
  const createRandomStar = (
    width: number, 
    height: number, 
    layer: number
  ): Star => {
    const x = Math.random() * width
    const y = Math.random() * height

    // レイヤーによって星のサイズと明るさを変える
    let size, opacity
    
    if (layer === 0) { // 固定背景の星（無限遠）
      size = Math.random() * 0.6 + 0.2 // 最も小さい
      opacity = 0.1 + Math.random() * 0.3 // 最も暗い
    } else if (layer === 1) { // 中間層
      size = Math.random() * 1.0 + 0.5 // 中くらい
      opacity = 0.3 + Math.random() * 0.4 // 中程度の明るさ
    } else { // 前景
      size = Math.random() * 1.8 + 0.7 // 最も大きい
      opacity = 0.6 + Math.random() * 0.4 // 最も明るい
    }

    return {
      x,
      y,
      size,
      opacity,
      layer,
    }
  }

  // キャンバスの初期化
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // キャンバスサイズをウィンドウに合わせる
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // 星を生成（画面サイズに応じて数を調整）
      const starCount = Math.min(350, Math.floor((window.innerWidth * window.innerHeight) / 2000))
      starsRef.current = generateStars(starCount, canvas.width, canvas.height)
    }

    setCanvasSize()

    // リサイズイベントを間引く
    let resizeTimeout: number
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(setCanvasSize, 200)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  // 星の描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)

      // 背景を黒に
      context.fillStyle = "#000"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // 各レイヤーの星を描画
      starsRef.current.forEach(star => {
        context.beginPath()
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        context.closePath()
        context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        context.fill()
      })
    }

    draw()
  }, [])

  return <BackgroundCanvas ref={canvasRef} />
}

export default React.memo(LogoStarBackground) 