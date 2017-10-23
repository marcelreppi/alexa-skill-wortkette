'use strict';

const Alexa = require('alexa-sdk');
const APP_ID // removed from public

const words = require('./words.js')

const gameStates = {
    START: 'Start',
    PLAYING: 'Playing',
}

let currentGameState = gameStates.START
let helpNeeded = false
let lastWord = ''

const handlers = {
    'LaunchRequest': function () {
        this.emit('StartIntent')
    },
    'StartIntent': function () {
        if(currentGameState == gameStates.PLAYING){
            this.attributes.speechOutput = 'Das Spiel läuft bereits. Ich habe zuletzt ' + lastWord + ' gesagt!';
            this.attributes.repromptSpeech = 'Das Spiel läuft bereits. Ich habe zuletzt ' + lastWord + ' gesagt!';
            this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
            return
        }        
        currentGameState = gameStates.PLAYING
        let answerIndex = Math.floor(Math.random() * words.length)
        let randomAnswer = words[answerIndex]
        lastWord = randomAnswer
        this.attributes.lastWord = lastWord
        this.attributes.speechOutput = 'Hallo, lass uns Wortkette spielen! Ich fange an mit ' + randomAnswer;
        this.attributes.repromptSpeech = 'Ich habe ' + randomAnswer + ' gesagt. Jetzt bist du dran!';
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'StopIntent': function () {
        this.emit('SessionEndedRequest')
    },
    'RepeatIntent': function () {
        if(currentGameState != gameStates.PLAYING){
            this.attributes.speechOutput = 'Das Spiel hat noch nicht begonnen. Zum starten, sag einfach Start';
            this.attributes.repromptSpeech = 'Das Spiel hat noch nicht begonnen. Zum starten, sag einfach Start';
        }else{
            this.attributes.speechOutput = 'Ich habe zuletzt ' + lastWord + ' gesagt.';
            this.attributes.repromptSpeech = 'Ich habe zuletzt ' + lastWord + ' gesagt.';
        }
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'PlayIntent': function () {
        if(currentGameState == gameStates.PLAYING){
            const userWord = this.event.request.intent.slots.Word.value;
            if(lastWord !== ''){
                if(userWord[0].toLowerCase() != lastWord[lastWord.length - 1].toLowerCase()){
                    let speechOutput = 'Dein Wort hat nicht mit dem letzten Buchstaben von meinem letzten Wort angefangen. Ich habe ' + lastWord + ' gesagt. Probiere ein neues Wort!';
                    this.attributes.speechOutput = speechOutput;
                    this.attributes.repromptSpeech = speechOutput;
                    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
                    return
                }
            }
            let possibleAnswers = words.filter((word) => {
                return word[0].toLowerCase() == userWord[userWord.length - 1].toLowerCase()
            })
            let answerIndex = Math.floor(Math.random() * possibleAnswers.length)
            let randomAnswer = possibleAnswers[answerIndex]
            lastWord = randomAnswer
            this.attributes.lastWord = lastWord
            this.attributes.speechOutput = randomAnswer;
            this.attributes.repromptSpeech = randomAnswer;
            this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
        } else {
            let output = 'Das Spiel hat noch nicht begonnen. Zum starten, sag einfach Start.'
            this.attributes.speechOutput = output;
            this.attributes.repromptSpeech = output;
            this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
        }
    },
    'HelpIntent': function () {
        this.emit('AMAZON.HelpIntent')
    },
    'AMAZON.HelpIntent': function () {
        helpNeeded = true
        let output = 'Das Wortkette Spiel funktioniert so: Du musst immer ein passendes Wort, was mit dem letzten Buchstaben' +
        'von meinem vorherigen Wort beginnt sagen!' +
        'Ein Beispiel wäre: Wenn du auf das Wort Haus, das Wort Signal antwortest!' +
        'Um das Spiel zu starten: sag einfach Start!' +
        'Um das Spiel zu beenden sag einfach: Ende!' +
        'Wenn du mein letztes Wort nochmal hören möchtest sag einfach: Nochmal!' +
        'Bitte benutze während dem Spiel keine dieser Keywords!' +
        'Sag mir wie es weiter gehen soll!'
        this.attributes.speechOutput = output;
        this.attributes.repromptSpeech = output;
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        currentGameState = gameStates.START
        lastWord = ''
        this.attributes.lastWord = ''
        this.emit(':tell', 'Das Spiel ist vorbei. Ok! Danke! Tschüss!');
    },
    'Unhandled': function () {
        this.attributes.speechOutput = 'Sorry, das have ich nicht verstanden. Sag einfach ein passendes Wort. Ich habe ' + lastWord + ' gesagt.';
        this.attributes.repromptSpeech = 'Sorry, das have ich nicht verstanden. Sag einfach ein passendes Wort. Ich habe ' + lastWord + ' gesagt.';
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
