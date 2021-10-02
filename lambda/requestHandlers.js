const Alexa = require("ask-sdk-core")

const words = require("./words")
const { getState, setState, resetState } = require("./state")
const { getRandomEntry, respond } = require("./helpers")

function handleUnstartedGame(handlerInput) {
  const speakOutput =
    "Das Spiel hat noch nicht begonnen. Zum starten, sag einfach: Starte Wortkette"
  const repromptOutput = speakOutput
  return respond({ handlerInput, speakOutput, repromptOutput })
}

function getNextWord(letter) {
  const possibleWords = words.filter((word) => {
    return word[0].toLowerCase() === letter.toLowerCase()
  })
  return getRandomEntry(possibleWords)
}

exports.LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
  },
  handle(handlerInput) {
    const { gameIsRunning, lastWord, roundCounter } = getState(handlerInput)

    let speakOutput = ""
    let repromptOutput = ""

    if (gameIsRunning) {
      speakOutput = `Das Spiel läuft bereits. Ich habe zuletzt, ${lastWord}, gesagt!`
      repromptOutput = speakOutput
      return respond(handlerInput, speakOutput, repromptOutput)
    }

    const nextWord = getRandomEntry(words)
    setState(handlerInput, {
      lastWord: nextWord,
      roundCounter: roundCounter + 1,
      gameIsRunning: true,
    })

    speakOutput = `Hallo, lass uns Wortkette spielen! Ich fange an mit, ${nextWord}`
    repromptOutput = `Ich habe, ${nextWord}, gesagt. Jetzt bist du dran!`

    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}

exports.PlayIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "PlayIntent"
    )
  },
  handle(handlerInput) {
    const { gameIsRunning, lastWord, roundCounter } = getState(handlerInput)

    if (!gameIsRunning) {
      return handleUnstartedGame(handlerInput)
    }

    const userWord = handlerInput.requestEnvelope.request.intent.slots.USER_WORD.value
    if (lastWord !== "") {
      if (userWord[0].toLowerCase() !== lastWord.slice(-1).toLowerCase()) {
        const speakOutput = `Dein Wort, ${userWord}, beginnt nicht mit dem letzten Buchstaben von meinem letzten Wort. Probiere bitte ein neues Wort! Ich habe zuletzt, ${lastWord}, gesagt.`
        const repromptOutput = speakOutput
        return respond({ handlerInput, speakOutput, repromptOutput })
      }
    }

    const nextWord = getNextWord(userWord.slice(-1))
    setState(handlerInput, { lastWord: nextWord, roundCounter: roundCounter + 1 })

    const speakOutput = nextWord
    const repromptOutput = speakOutput

    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}

exports.SkipWordIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "SkipWordIntent"
    )
  },
  handle(handlerInput) {
    const { gameIsRunning, lastWord, skipWordCounter } = getState(handlerInput)

    if (!gameIsRunning) {
      return handleUnstartedGame(handlerInput)
    }

    const nextWord = getNextWord(lastWord[0])
    setState(handlerInput, { lastWord: nextWord, skipWordCounter: skipWordCounter + 1 })

    const speakOutput = nextWord
    const repromptOutput = speakOutput

    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}

exports.RepeatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.RepeatIntent"
    )
  },
  handle(handlerInput) {
    const { gameIsRunning, lastWord } = getState(handlerInput)

    if (!gameIsRunning) {
      return handleUnstartedGame(handlerInput)
    }

    const speakOutput = `Ich habe zuletzt, ${lastWord}, gesagt.`
    const repromptOutput = speakOutput
    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}

exports.HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    )
  },
  handle(handlerInput) {
    const output = [
      "Das Wortkette Spiel funktioniert so: Du musst immer ein passendes Wort sagen, was mit dem letzten Buchstaben von meinem vorherigen Wort beginnt!",
      "Ein Beispiel wäre: Wenn du auf das Wort, Haus, das Wort, Signal, antwortest.",
      "Um das Spiel zu starten: sag einfach: Starte Wortkette!",
      "Um das Spiel zu beenden sag einfach: Ende!",
      "Wenn du mein letztes Wort nochmal hören möchtest sag einfach: Nochmal!",
      "Falls du willst, dass ich ein anderes Wort wähle sag einfach: Weiter!",
      "Bitte benutze während dem Spiel keine dieser Keywords!",
      "Sag mir wie es weiter gehen soll!",
    ]

    const speakOutput = output.join(" ")
    const repromptOutput = speakOutput

    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}

exports.CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.StopIntent")
    )
  },
  handle(handlerInput) {
    const { roundCounter, skipWordCounter } = getState(handlerInput)
    resetState(handlerInput)

    const skipNotice =
      skipWordCounter > 5
        ? `Du hast ${skipWordCounter} Mal mein Wort übersprungen. Ich bin mir sicher das kannst du noch besser.`
        : ""
    const praise = skipNotice === "" && roundCounter > 10 ? "Gut gemacht!" : ""

    const goodbyeMessages = [
      "Danke! Tschüss!",
      "Danke fürs Spielen",
      "Danke! Hab noch einen schönen Tag!",
      "Vielen Dank und bis bald!",
      "Danke! Auf Wiedersehen!",
    ]
    const goodbyeMessage = getRandomEntry(goodbyeMessages)
    const speakOutput = `Das Spiel ist nach ${roundCounter} ${
      roundCounter > 1 ? "Runden" : "Runde"
    } vorbei. ${skipNotice} ${praise} ${goodbyeMessage}`

    return respond({ handlerInput, speakOutput, endSession: true })
  },
}

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
exports.FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent"
    )
  },
  handle(handlerInput) {
    const { lastWord } = getState(handlerInput)

    const speakOutput = `Sorry, das habe ich nicht verstanden. Ich habe zuletzt, ${lastWord}, gesagt. Sag einfach ein passendes Wort was mit dem letzten Buchstaben von "${lastWord}" anfängt.`
    const repromptOutput = speakOutput

    return respond({ handlerInput, speakOutput, repromptOutput })
  },
}

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
exports.SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "SessionEndedRequest"
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope, null, 2)}`)
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse() // notice we send an empty response
  },
}

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
exports.IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope)
    const speakOutput = `You just triggered ${intentName}`

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    )
  },
}
