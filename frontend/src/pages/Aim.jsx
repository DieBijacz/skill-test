import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullseye } from '@fortawesome/free-solid-svg-icons'
import { getScore, resetScore, saveScore } from '../components/utilities';
import { Line } from 'react-chartjs-2';

const Aim = () => {
  const targetSizePixels = 80;
  const numberOfTargets = 5

  const [runGame, setRunGame] = useState(false)
  const [startTime, setStartTime] = useState(undefined)
  const [score, setScore] = useState()
  const [targetsLeft, setTargetsLeft] = useState(numberOfTargets)
  const [targetCoords, setTargetCoords] = useState([-targetSizePixels, -targetSizePixels])
  const [chartData, setChartData] = useState()
  const [dataSaved, setDataSaved] = useState(false)
  const [scoreReset, setScoreReset] = useState(false)
  const board = useRef()

  const startGame = () => {
    setRunGame(true)
    setStartTime(() => Date.now());
  }

  const handleClick = () => {
    // coords for new target

    // target clicks
    targetsLeft > 1 ? setTargetsLeft(left => left -= 1) : endGame()

    // off - target
  }

  const createTarget = () => {
    const boardWith = board.current.offsetWidth
    const boardHeight = board.current.offsetHeight

    const newTargetX = Math.floor(Math.random() * (boardWith - targetSizePixels))
    const newTargetY = Math.floor(Math.random() * (boardHeight - targetSizePixels))
    setTargetCoords([newTargetX, newTargetY])
  }

  const endGame = () => {
    const currentTime = Date.now()
    setScore((currentTime - startTime) / numberOfTargets)
    setRunGame(false)
    setStartTime(undefined)
    setTargetCoords([-targetSizePixels, -targetSizePixels])
    setTargetsLeft(numberOfTargets)
  }

  // START GAME
  useEffect(() => {
    if (runGame && targetsLeft !== 0) createTarget()
  }, [targetsLeft, runGame])

  // SAVE SCORE IN DB
  useEffect(() => {
    if (score < 1000) {
      saveScore('aim-trainer', score, setDataSaved)
    }
  }, [score])

  // GET DATA FOR CHART
  useEffect(() => {
    getScore('aim-trainer', setChartData)
    setDataSaved(false)
    setScoreReset(false)
  }, [dataSaved, scoreReset])

  //chart data
  const data = {
    labels: Object.keys(chartData ? chartData : []),
    datasets: [{
      data: Object.values(chartData ? chartData : []),
      backgroundColor: 'white',
      borderColor: '#2573C1',
      pointBorderColor: '#2573C1',
      tension: .4,
    }]
  }

  // chart options
  const chartOptions = {
    plugins: {
      legend: true
    },
    scales: {
      y: { min: 0, max: chartData ? Math.max(...Object.values(chartData)) + 10 : 100 },
      x: { min: 0, max: 1000 }
    }
  }

  return (
    <div>
      {runGame ?
        <div id='aim-trainer-game' className={`background blue`}>
          <div className="remaining">Remaining: {targetsLeft}</div>
          <div className="board container" ref={board}>
            <div className='target' style={{ left: targetCoords[0], top: targetCoords[1] }}>
              <FontAwesomeIcon icon={faBullseye} onClick={() => handleClick()} style={{ fontSize: `${targetSizePixels}px` }} />
            </div>
          </div>
        </div>
        :
        <div id='aim-trainer' className={`background blue`} onClick={() => startGame()}>
          <FontAwesomeIcon icon={faBullseye} className='icon big-icon' />
          <div className='title'>Aim Trainer</div>
          <p>Hit 30 targets as quickly as you can.</p>
          <p>Click anywhere to start.</p>
        </div>
      }
      <section className="container">
        <div id='statistics' className="card-container grid-2">
          <div className='card'>
            <div className="chart-container">
              <div className='spaced'>
                <h1>Statistics</h1>
                <button className='btn' id='reset-data-btn' onClick={() => resetScore('aim-trainer', setScoreReset)}>reset</button>
              </div>
              <Line data={data} options={chartOptions} />
            </div>
          </div>
          <div className='card'>
            <h1>About the test</h1>
            <p>Click the targets as quickly and accurately as you can.</p>
            <p>This tests reflexes and hand-eye coordination.</p>
            <p>Once you've clicked 30 targets, your score and average time per target will be displayed.</p>
            <p>Scores in this test are slower than the simple reaction time test, because you must react and then move the cursor.</p>
            <p>This test is best taken with a mouse or tablet screen. Trackpads are difficult to score well with.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Aim