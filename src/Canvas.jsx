import React, { useRef, useEffect } from 'react'

const Canvas = props => {

    const { draw, ...rest } = props
    const canvasRef = useRef(null)
    const randoms = new Array(8).fill(0).map(() => Array.from(Array(5000)).map(x => Math.random()))

    useEffect(() => {

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        let frameCount = 0
        let animationFrameId

        const render = () => {
            frameCount++
            draw(context, frameCount, randoms)
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])

    return <canvas ref={canvasRef} {...rest} />
}

export default Canvas