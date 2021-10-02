const Alexa = require("ask-sdk-core")

const { respond } = require("./helpers")

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
exports.GenericErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Sorry, ich hatte Probleme deine Antwort zu verarbeiten. Bitte versuche es nochmal."
    const repromptOutput = speakOutput

    console.log(`Request: ${JSON.stringify(handlerInput.requestEnvelope, null, 2)}`)

    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`)

    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}
