import React, { useRef, useEffect } from "react"
import styled from "styled-components"

interface StarBackgroundProps {
  scrollPosition: number
}

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
  speed: number
  layer: number // 0: 固定背景（無限遠）, 1: 中間層, 2: 前景（高速移動）
}

const StarBackground: React.FC<StarBackgroundProps> = ({ scrollPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>(0)
  const lastScrollPositionRef = useRef<number>(scrollPosition)
  const lastTimeRef = useRef<number>(0)

  // 星を生成する関数
  const generateStars = (count: number, width: number, height: number): Star[] => {
    const stars: Star[] = []

    // 層ごとの星の数を決定
    const bgStarCount = Math.floor(count * 0.5) // 50%は背景の固定星
    const midStarCount = Math.floor(count * 0.3) // 30%は中間層
    const fgStarCount = count - bgStarCount - midStarCount // 残り20%は前景

    // 背景の固定星（レイヤー0）
    for (let i = 0; i < bgStarCount; i++) {
      stars.push(createRandomStar(width, height, false, 0))
    }
    
    // 中間層の星（レイヤー1）
    for (let i = 0; i < midStarCount; i++) {
      stars.push(createRandomStar(width, height, false, 1))
    }
    
    // 前景の星（レイヤー2）
    for (let i = 0; i < fgStarCount; i++) {
      stars.push(createRandomStar(width, height, false, 2))
    }

    return stars
  }

  // ランダムな星を1つ生成する関数
  const createRandomStar = (
    width: number, 
    height: number, 
    isCenter: boolean = false, 
    layer: number = 1
  ): Star => {
    let x, y
    if (isCenter) {
      // 中央付近に配置
      const centerX = width / 2
      const centerY = height / 2
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 100 + 20 // 中央から少し離れた位置に配置
      x = centerX + Math.cos(angle) * distance
      y = centerY + Math.sin(angle) * distance
    } else {
      // 画面全体にランダムに配置
      x = Math.random() * width
      y = Math.random() * height
    }

    // レイヤーによって星のサイズと明るさを変える
    let size, opacity, speed
    
    if (layer === 0) { // 固定背景の星（無限遠）
      size = Math.random() * 0.6 + 0.2 // 最も小さい
      opacity = 0.1 + Math.random() * 0.3 // 最も暗い
      speed = 0 // 固定
    } else if (layer === 1) { // 中間層
      size = Math.random() * 1.0 + 0.5 // 中くらい
      opacity = 0.3 + Math.random() * 0.4 // 中程度の明るさ
      speed = 0.05 + Math.random() * 0.15 // 低速
    } else { // 前景（高速移動）
      size = Math.random() * 1.8 + 0.7 // 最も大きい
      opacity = isCenter ? 0.2 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4 // 最も明るい
      speed = 0.15 + Math.random() * 0.25 // 高速
    }

    return {
      x,
      y,
      size,
      opacity,
      speed,
      layer,
    }
  }

  // 画面外に新しい星を追加する関数（指定されたレイヤーの星を作成）
  const addStarOutside = (width: number, height: number, layer: number): Star => {
    const side = Math.floor(Math.random() * 4) // 0: 上, 1: 右, 2: 下, 3: 左
    let x, y
    
    switch (side) {
      case 0: // 上
        x = Math.random() * width
        y = -10
        break
      case 1: // 右
        x = width + 10
        y = Math.random() * height
        break
      case 2: // 下
        x = Math.random() * width
        y = height + 10
        break
      default: // 左
        x = -10
        y = Math.random() * height
        break
    }

    // レイヤーに応じたサイズと透明度
    let size, opacity, speed
    
    if (layer === 1) { // 中間層
      size = Math.random() * 1.0 + 0.5
      opacity = 0.3 + Math.random() * 0.4
      speed = 0.05 + Math.random() * 0.15
    } else { // 前景（デフォルト）
      size = Math.random() * 1.8 + 0.7
      opacity = 0.6 + Math.random() * 0.4
      speed = 0.15 + Math.random() * 0.25
    }

    return {
      x,
      y,
      size,
      opacity,
      speed,
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
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // 星のアニメーション
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // 中央点を計算
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const animate = (timestamp: number) => {
      // フレームレートを制限（60FPSを目標）
      if (timestamp - lastTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      lastTimeRef.current = timestamp

      context.clearRect(0, 0, canvas.width, canvas.height)

      // 背景を黒に
      context.fillStyle = "#000"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // スクロール位置の差分を計算
      const scrollDelta = scrollPosition - lastScrollPositionRef.current
      lastScrollPositionRef.current = scrollPosition

      // スクロールの方向のみを考慮（速度を一定にする）
      const scrollDirection = scrollDelta === 0 ? 0 : (scrollDelta > 0 ? 1 : -1)

      // 星の削除フラグ
      const starsToRemove: number[] = []
      let needNewForegroundStar = false
      let needNewMidgroundStar = false
      let needNewCenterStar = false

      // 背景層（無限遠の固定星）を描画
      const backgroundStars = starsRef.current.filter(star => star.layer === 0)
      backgroundStars.forEach(star => {
        context.beginPath()
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        context.closePath()
        context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        context.fill()
      })

      // 中間層の星を描画・更新
      const midgroundStars = starsRef.current.filter(star => star.layer === 1)
      midgroundStars.forEach(star => {
        // starsRef.current内のインデックスを計算（削除用）
        const index = starsRef.current.indexOf(star)
        
        // スクロール位置の変化に応じて星を中央から外側に移動（中間層は低速）
        if (scrollDirection !== 0) {
          // 中央からの方向ベクトルを計算
          const dirX = star.x - centerX
          const dirY = star.y - centerY
          
          // ベクトルの長さを計算（中央からの距離）
          const length = Math.sqrt(dirX * dirX + dirY * dirY)
          
          // 移動量を計算（一定速度、レイヤーに応じた速度）
          const moveAmount = 1.5 * star.speed
          
          if (length > 0) {
            // 正規化されたベクトルに移動量を掛ける
            const normalizedDirX = dirX / length
            const normalizedDirY = dirY / length
            
            // スクロール方向に応じて内側か外側に移動
            const direction = scrollDirection > 0 ? -1 : 1
            
            star.x += normalizedDirX * moveAmount * direction
            star.y += normalizedDirY * moveAmount * direction

            // 中央からの距離に応じて透明度を緩やかに調整（中間層は変化を小さく）
            const newDistance = Math.sqrt(
              Math.pow(star.x - centerX, 2) + 
              Math.pow(star.y - centerY, 2)
            )
            
            // 距離に基づいて透明度を調整（変化を緩やかに）
            const distanceFactor = Math.min(newDistance / 200, 1)
            star.opacity = 0.2 + distanceFactor * 0.5 // より穏やかな変化
            
            // 一定の暗さになったら削除（中間層は閾値を低く）
            if (direction < 0 && star.opacity < 0.25 && newDistance < 70) {
              starsToRemove.push(index)
              needNewMidgroundStar = true
            }
          }
        }

        // 画面外に出た星をマーク
        if (star.x < -10 || star.x > canvas.width + 10 || 
            star.y < -10 || star.y > canvas.height + 10) {
          starsToRemove.push(index)
          needNewCenterStar = true
        }

        // 星を描画
        context.beginPath()
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        context.closePath()
        context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        context.fill()
      })

      // 前景層の星（高速移動）を描画・更新
      const foregroundStars = starsRef.current.filter(star => star.layer === 2)
      foregroundStars.forEach(star => {
        // starsRef.current内のインデックスを計算（削除用）
        const index = starsRef.current.indexOf(star)
        
        // スクロール位置の変化に応じて星を中央から外側に移動（前景は高速）
        if (scrollDirection !== 0) {
          // 中央からの方向ベクトルを計算
          const dirX = star.x - centerX
          const dirY = star.y - centerY
          
          // ベクトルの長さを計算（中央からの距離）
          const length = Math.sqrt(dirX * dirX + dirY * dirY)
          
          // 移動量を計算（一定速度、レイヤーに応じた速度 - 前景は高速）
          const moveAmount = 3 * star.speed
          
          if (length > 0) {
            // 正規化されたベクトルに移動量を掛ける
            const normalizedDirX = dirX / length
            const normalizedDirY = dirY / length
            
            // スクロール方向に応じて内側か外側に移動
            const direction = scrollDirection > 0 ? -1 : 1
            
            star.x += normalizedDirX * moveAmount * direction
            star.y += normalizedDirY * moveAmount * direction

            // 中央からの距離に応じて透明度を調整（前景は変化を大きく）
            const newDistance = Math.sqrt(
              Math.pow(star.x - centerX, 2) + 
              Math.pow(star.y - centerY, 2)
            )
            
            // 距離に基づいて透明度を常に調整（変化を急激に）
            const distanceFactor = Math.min(newDistance / 120, 1)
            star.opacity = 0.1 + distanceFactor * 0.9 // より急激な変化
            
            // 一定の暗さになったら削除（前景は閾値を高く）
            if (direction < 0 && star.opacity < 0.2 && newDistance < 40) {
              starsToRemove.push(index)
              needNewForegroundStar = true
            }
          }
        }

        // 画面外に出た星をマーク
        if (star.x < -10 || star.x > canvas.width + 10 || 
            star.y < -10 || star.y > canvas.height + 10) {
          starsToRemove.push(index)
          needNewForegroundStar = true
        }

        // 星を描画
        context.beginPath()
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        context.closePath()
        context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        context.fill()
      })

      // 削除する星を削除（後ろから削除して配列インデックスへの影響を回避）
      starsToRemove.sort((a, b) => b - a).forEach(index => {
        starsRef.current.splice(index, 1)
      })

      // 新しい星を追加
      if (needNewForegroundStar) {
        starsRef.current.push(addStarOutside(canvas.width, canvas.height, 2))
      }
      
      if (needNewMidgroundStar) {
        starsRef.current.push(addStarOutside(canvas.width, canvas.height, 1))
      }
      
      if (needNewCenterStar) {
        // 中央に新しい星を追加（中間層）
        starsRef.current.push(createRandomStar(canvas.width, canvas.height, true, 1))
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [scrollPosition])

  return <BackgroundCanvas ref={canvasRef} />
}

export default React.memo(StarBackground)
