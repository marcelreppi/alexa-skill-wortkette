const Alexa = require("ask-sdk-core")

const {
  LaunchRequestHandler,
  PlayIntentHandler,
  SkipWordIntentHandler,
  RepeatIntentHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  IntentReflectorHandler,
} = require("./requestHandlers")

const { GenericErrorHandler } = require("./errorHandlers")

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    PlayIntentHandler,
    SkipWordIntentHandler,
    RepeatIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(GenericErrorHandler)
  .lambda()
