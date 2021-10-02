exports.isNil = (thing) => thing === undefined || thing === null

exports.getRandomEntry = (array) => array[Math.floor(Math.random() * array.length)]

exports.respond = ({ handlerInput, speakOutput, repromptOutput = "", endSession = false }) => {
  let responseBuilder = handlerInput.responseBuilder.speak(speakOutput)

  if (repromptOutput !== "") {
    responseBuilder = responseBuilder.reprompt(repromptOutput)
  }

  if (endSession) {
    responseBuilder = responseBuilder.withShouldEndSession(true)
  }

  return responseBuilder.getResponse()
}
