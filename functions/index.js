const print = require('./print')
const functions = require('firebase-functions')
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');

const extensionId = functions.config().clova.extension.id


const clovaSkillHandler = clova.Client
    .configureSkill()

    //起動時に喋る
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('今日も頑張ったあなたに賞状をあげるよ。ところで、昨日は寝ましたか？'))
    })

    //ユーザーからの発話が来たら反応する箇所
    .onIntentRequest(async responseHelper => {
        const intent = responseHelper.getIntentName();
        const slots = responseHelper.getSlots();

        console.log('Intent:' + intent);

        switch (intent) {
            case 'intentPrint':
                await print('./award.pdf')
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('賞状を印刷したよ。')).endSession()
                break
            case 'Clova.YesIntent':
                await print('./sleep.pdf')
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('賞状を印刷したよ。')).endSession()
                break
            case 'Clova.NoIntent':
                await print('./nonsleep.pdf')
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('賞状を印刷したよ。')).endSession()
                break
            default:
                responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText(`もう一度お願いします`));
                break;
        }
    })

    //終了時
    .onSessionEndedRequest(responseHelper => {
        const sessionId = responseHelper.getSessionId();
    })
    .handle();

const app = new express();

const clovaMiddleware = clova.Middleware({ applicationId: extensionId });
app.use( (req, res, next) => {
    req.body = JSON.stringify(req.body)
    next()
})
app.post('/clova', clovaMiddleware, clovaSkillHandler);

exports.clova = functions.https.onRequest(app);
