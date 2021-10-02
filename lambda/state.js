const { isNil } = require("./helpers")

const defaultState = {
  lastWord: "",
  gameIsRunning: false,
  roundCounter: 0,
  skipWordCounter: 0,
}

function getState(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
  const state = Object.assign({}, defaultState, sessionAttributes)
  return state
}

function setState(handlerInput, { lastWord, gameIsRunning, roundCounter, skipWordCounter }) {
  const oldState = getState(handlerInput)
  const newState = {
    lastWord: !isNil(lastWord) ? lastWord : oldState.lastWord,
    gameIsRunning: !isNil(gameIsRunning) ? gameIsRunning : oldState.gameIsRunning,
    roundCounter: !isNil(roundCounter) ? roundCounter : oldState.roundCounter,
    skipWordCounter: !isNil(skipWordCounter) ? skipWordCounter : oldState.skipWordCounter,
  }
  return handlerInput.attributesManager.setSessionAttributes(newState)
}

function resetState(handlerInput) {
  return handlerInput.attributesManager.setSessionAttributes(defaultState)
}

module.exports = {
  getState,
  setState,
  resetState,
}
