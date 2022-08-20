import React from 'react';
import Canvas from './Canvas'
import './App.css';

const currentSefira = 7

const fractalDepth = 5
const maxBranchCapacity = 6

// Window Size
const canvasSize = 700
const initialRadius = canvasSize * 0.15
const initialCenterX = canvasSize / 2
const initialCenterY = 700 / 2

// Ratios
const randomDriftRatio = 3.0 / 4
const fractalSizeRatio = 1.0 / 3
const chesedRatio = 0.6
const gevuraRatio = 1.33
const tiferetRatio = 1.0 / 7
const netzachRatio = 0.30
const hodRadiusRatio = 0.63
const hodWidthRatio = 0.05
const hodMiddleBranchRatio = 1.5
const hodSideBranchRatio = 0.7
const malchutRatio = 0.58

// Angles
const netzachAngle = Math.PI / 35

// Colors
const chesedColor = '#0a2c63'
const gevuraColor = '#660e0e'
const tiferetColor = '#234d32'
const netzachColor = '#4d3469'
const hodColor = '#FFA400'
const yesodColor = '#6B4B31'
const malchutColor = '#101010'
const keterColor = 'white'
const backgroundColor = 'white'

function App() {

  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  function shuffleArray(array: number[][], randomValue: number) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(randomValue * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  const scaleVector = (a: number[], b: number[], diff: number): number[] => {
    let xDiff = b[0] - a[0]
    let yDiff = b[1] - a[1]
    let magnitude = Math.sqrt(xDiff ** 2 + yDiff ** 2)
    let scale = 1
    if (diff < 0) {
      let posDiff = -1 * diff
      scale = (magnitude - (posDiff * fractalSizeRatio)) / magnitude
    } else {
      scale = (magnitude + (diff * fractalSizeRatio)) / magnitude
    }
    return [a[0] + xDiff * scale, a[1] + yDiff * scale]
  }

  const getVectorScale = (a: number[], b: number[]): number => {
    let xDiff = b[0] - a[0]
    let yDiff = b[1] - a[1]
    return Math.sqrt(xDiff ** 2 + yDiff ** 2)
  }

  const getAngleRad = (p1: number[], p2: number[]): number =>
    Math.atan2(p2[1] - p1[1], p2[0] - p1[0])

  const getAngleRadRounded = (p1: number[], p2: number[]): number =>
    Math.round(getAngleRad(p1, p2) * 10) / 10

  const drawSefirot = (ctx: CanvasRenderingContext2D, sefira: number, frameCount: number, randoms: number[][]) => {
    ctx.canvas.width = canvasSize
    ctx.canvas.height = canvasSize
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let randomsCounterByLevel = new Array(fractalDepth + 1).fill(0)

    const fractal = (centerX: number, centerY: number, radius: number, depthRemaining: number, level: number, branchCapacity: number, parentPt: number[]) => {

      if (depthRemaining === 0) return

      const centerPt = [centerX, centerY]

      let branches = [
        [centerX - (3 * radius / 4 + radius / 3), centerY - (radius / 3 + radius / 3)],
        [centerX, centerY - (radius + radius / 3.5)],
        [centerX + (3 * radius / 4 + radius / 3), centerY - (radius / 3 + radius / 3)],
        [centerX + (3 * radius / 4 + radius / 3), centerY + (radius / 3 + radius / 3)],
        [centerX, centerY + (radius + radius / 3.5)],
        [centerX - (3 * radius / 4 + radius / 3), centerY + (radius / 3 + radius / 3)]
      ]

      // CHESED
      if (sefira === 1) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * gevuraRatio, 0, 2 * Math.PI, false);
        ctx.fillStyle = chesedColor;
        ctx.fill()
      }

      // GEVURAH
      if (sefira >= 2) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * gevuraRatio, 0, 2 * Math.PI, false);
        ctx.fillStyle = gevuraColor;
        ctx.fill()
      }

      // NETZACH
      const originalBranches = [...branches]
      let shuffledBranches = [...branches]
      if (sefira >= 4) {
        let randomsForLevel = randoms[level]
        shuffleArray(branches, randomsForLevel[randomsCounterByLevel[level]])
        randomsCounterByLevel[level] += 1
        branches = branches.slice(0, branchCapacity)
        shuffledBranches = [...branches]

        for (let i = 0; i < branches.length; i++) {
          let plusMinus = randomsForLevel[randomsCounterByLevel[level]] < 0.5 ? 1 : -1
          randomsCounterByLevel[level] += 1
          branches[i] = scaleVector(centerPt, branches[i], randomsForLevel[randomsCounterByLevel[level]] * (radius * randomDriftRatio) * plusMinus)
          randomsCounterByLevel[level] += 1
          branches[i] = scaleVector(centerPt, branches[i], radius * randomDriftRatio)
        }
      }

      // HOD
      const preHodBranches = [...branches]
      let branchCapacities = new Array(3).fill(0)
      let maxBranch = shuffledBranches[shuffledBranches.length - 1]
      if (
        maxBranch && 
        getAngleRadRounded(centerPt, maxBranch) === getAngleRadRounded(centerPt, parentPt) && 
        shuffledBranches.length > 1 && 
        level !== 0
      ) {
        // If the max branch would be covered by the Tiferet visualization, use the next branch instead.
        shuffledBranches = [shuffledBranches[shuffledBranches.length - 1], ...shuffledBranches.slice(1, -1)]
        maxBranch = shuffledBranches[shuffledBranches.length - 1]
      }
      let beforeBranchMissing = false
      let afterBranchMissing = false
      if (sefira >= 5 && branches.length >= 3) {
        const findBranchIndexByPoint = (br: number[][], a: number[]) =>
          br.findIndex((b) =>
            a[0] === b[0] && a[1] === b[1]
          )

        let maxBranchIndex = findBranchIndexByPoint(originalBranches, maxBranch)
        let beforeBranch = originalBranches.slice(maxBranchIndex - 1, maxBranchIndex || undefined)[0]
        let afterBranch = originalBranches.slice((maxBranchIndex + 1) % originalBranches.length, ((maxBranchIndex + 2) % originalBranches.length) || undefined)[0]
        let beforeBranchIndex = findBranchIndexByPoint(shuffledBranches, beforeBranch)
        let beforeBranchCapacity = beforeBranchIndex + 1
        let afterBranchIndex = findBranchIndexByPoint(shuffledBranches, afterBranch)
        let afterBranchCapacity = afterBranchIndex + 1

        branchCapacities = [branches.length]
        branches = [scaleVector(centerPt, maxBranch, radius * hodMiddleBranchRatio)]
        beforeBranchMissing = true
        afterBranchMissing = true
        if (beforeBranchIndex !== -1) {
          beforeBranchMissing = false
          beforeBranch = scaleVector(centerPt, preHodBranches[beforeBranchIndex], -radius * hodSideBranchRatio)
          branches = [beforeBranch, ...branches]
          branchCapacities = [beforeBranchCapacity, ...branchCapacities]
        }
        if (afterBranchIndex !== -1) {
          afterBranchMissing = false
          afterBranch = scaleVector(centerPt, preHodBranches[afterBranchIndex], -radius * hodSideBranchRatio)
          branches = [afterBranch, ...branches]
          branchCapacities = [afterBranchCapacity, ...branchCapacities]
        }
      }

      for (let i = 0; i < branches.length; i++) {
  
        // HOD
        let branchCapacity = i + 1
        let nextRadius = radius * fractalSizeRatio
        if (sefira >= 5) {
          branchCapacity = branchCapacities[i]
          if (branchCapacity === 6) nextRadius *= hodMiddleBranchRatio
        }

        // RECURSE //
        fractal(branches[i][0], branches[i][1], nextRadius, depthRemaining - 1, level + 1, branchCapacity, centerPt)
        
        if (depthRemaining === 1) break;

        // TIFERET  
        if (sefira >= 3) {
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.strokeStyle = tiferetColor;
          if (sefira >= 6 && branchCapacity === 6) {
            ctx.strokeStyle = yesodColor
          }
          ctx.lineWidth = radius * tiferetRatio
          let branchScaleFactor = -1 * radius * chesedRatio * 0.9
          if (sefira >= 5 && branchCapacity === 6) branchScaleFactor *= hodMiddleBranchRatio
          let branchEndPoint = scaleVector(centerPt, branches[i], branchScaleFactor)
          ctx.lineTo(branchEndPoint[0], branchEndPoint[1]);
          ctx.stroke();
        }
      }

      // CHESED
      if (sefira > 1) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * chesedRatio, 0, 2 * Math.PI, false);
        ctx.fillStyle = chesedColor;
        ctx.fill()
      }

      // NETZACH
      if (sefira >= 4) {
        for (let i = 0; i < preHodBranches.length; i++) {
          let branchAngle = getAngleRad(centerPt, preHodBranches[i])

          let modifiedBranchScale = getVectorScale(centerPt, preHodBranches[i])
          let originalBranchScale = getVectorScale(centerPt, originalBranches[i])
          let branchRatio = modifiedBranchScale / originalBranchScale
          branchRatio = branchRatio ** branchRatio

          ctx.beginPath()
          ctx.arc(centerX, centerY, radius * netzachRatio * branchRatio, branchAngle - netzachAngle, branchAngle + netzachAngle, false)
          ctx.lineTo(centerX, centerY)
          ctx.fillStyle = netzachColor
          ctx.fill()
        }
      }

      // HOD
      if (sefira >= 5 && maxBranch && preHodBranches.length !== branches.length && depthRemaining !== 1) {
        let oppositeBranchAngle = getAngleRad(centerPt, maxBranch) + Math.PI
        let negativeAngle = oppositeBranchAngle - Math.PI * 0.5
        if (afterBranchMissing) negativeAngle -= Math.PI * 0.35
        let positiveAngle = oppositeBranchAngle + Math.PI * 0.5
        if (beforeBranchMissing) positiveAngle += Math.PI * 0.35
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * hodRadiusRatio, negativeAngle, positiveAngle, false)
        ctx.strokeStyle = hodColor
        ctx.lineWidth = radius * hodWidthRatio
        ctx.stroke()
      }

      // YESOD
      if (sefira >= 6 && branchCapacity === 6) {
        let maxBranchAngle = getAngleRad(centerPt, maxBranch)
        let mBranchStartAngle = maxBranchAngle - tiferetRatio * 0.27 * Math.PI
        let mBranchEndAngle = maxBranchAngle + tiferetRatio * 0.27 * Math.PI
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * chesedRatio * 1.025, mBranchStartAngle, mBranchEndAngle)
        ctx.fillStyle = yesodColor
        ctx.lineTo(centerX, centerY)
        ctx.fill()
        ctx.beginPath()
        let startingPt = scaleVector(maxBranch, centerPt, - radius * 1.8)
        ctx.moveTo(startingPt[0], startingPt[1])
        let reachPt = scaleVector(centerPt, maxBranch, radius / 6.6)
        ctx.lineWidth = tiferetRatio * radius
        ctx.strokeStyle = yesodColor
        ctx.lineTo(reachPt[0], reachPt[1])
        ctx.stroke()
      }
      if (sefira >= 6 && branchCapacity === 6 && level !== 0) {
        let parentPtAngle = getAngleRad(centerPt, parentPt)
        let parentStartAngle = parentPtAngle - tiferetRatio * 0.55 * Math.PI
        let parentEndAngle = parentPtAngle + tiferetRatio * 0.55 * Math.PI
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * chesedRatio, parentStartAngle, parentEndAngle)
        ctx.fillStyle = yesodColor
        ctx.lineTo(centerX, centerY)
        ctx.fill()
      }

      // MALCHUT + KETER
      if (sefira >= 7 && (level + 1 === fractalDepth || (branchCapacity === 6 && (depthRemaining !== 1)))) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * malchutRatio * 1.05, 0, 2 * Math.PI, false);
        ctx.fillStyle = keterColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * malchutRatio, 0, 2 * Math.PI, false);
        ctx.fillStyle = malchutColor;
        ctx.fill();
      }
    }

    fractal(initialCenterX, initialCenterY, initialRadius, Math.min(fractalDepth, (Math.round(frameCount / 100) + 1)), 0, maxBranchCapacity, [initialCenterX, initialCenterY])
  }

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number, randoms: number[][]) => {
    drawSefirot(ctx, currentSefira, frameCount, randoms)
  }

  return <Canvas draw={draw} />
}

export default App;
