const startSound = new Audio('/sounds/start-recording.mp3')
const stopSound = new Audio('/sounds/stop-recording.mp3')

startSound.volume = 0.5
stopSound.volume = 0.5

export const playStartSound = () => {
  startSound.currentTime = 0
  startSound.play()
}

export const playStopSound = () => {
  stopSound.currentTime = 0
  stopSound.play()
} 