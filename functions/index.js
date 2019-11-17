const print = require('./print')
const functions = require('firebase-functions')
const clova = require('@line/clova-cek-sdk-nodejs')
const express = require('express')

const extensionId = functions.config().clova.extension.id


const clovaSkillHandler = clova.Client
    .configureSkill()

    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('今日も頑張ったあなたに賞状をあげるよ。ところで、昨日は寝たかな？'))
    })

    .onIntentRequest(async responseHelper => {
        const intent = responseHelper.getIntentName()
        const phasePrint = '賞状を印刷したよ。'

        switch (intent) {
            case 'intentPrint':
                await print('./noaward.pdf')
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText(phasePrint)).endSession()
                break
            case 'Clova.YesIntent':
                await print('./sleep.pdf')
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText(phasePrint)).endSession()
                break
            case 'Clova.NoIntent':
                await print('./nonsleep.pdf')
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText(phasePrint)).endSession()
                break
            default:
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('聞こえなかったよ。昨日はちゃんと寝たかな？'))
                break
        }
    })

    //終了時
    .onSessionEndedRequest(responseHelper => {
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('さようなら。また呼んでね。')).endSession()
    })
    .handle()

const app = new express()

const clovaMiddleware = clova.Middleware({ applicationId: extensionId })
app.use( (req, _, next) => {
    req.body = JSON.stringify(req.body)
    next()
})
app.post('/clova', clovaMiddleware, clovaSkillHandler)

exports.clova = functions.https.onRequest(app)
