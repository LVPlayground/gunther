// Copyright 2020 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const { WebhookClient } = require('dialogflow-fulfillment');

const functions = require('firebase-functions');

const { translationAction } = require('./translation_action.js');

process.env.DEBUG = '*'; // enables lib debugging statements

// The fulfillment handler, which listens to the given |request|. A map of supported actions to
// their customised handlers will be given back to the agent.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });

    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // The actions that can be handled by Gunther's Webhook. These map to the "action" field in the
    // Dialogflow Console and can be configured to the same value for multiple intents.
    const kSupportedActions = new Map([
        [ 'translate.text', translationAction ],
    ]);

    // If the |agent|'s action is supported by the |kSupportedActions|, immediately dispatch through
    // to the appropriate action handler. This should effectively always be the case.
    if (kSupportedActions.has(agent.action)) {
        const handler = kSupportedActions.get(agent.action);

        return Promise.resolve(handler(agent))
                      .then(() => agent.send_());
    }

    // Otherwise nothing was able to handle the |request|. Throw an error.
    return Promise.reject(new Error('No handler for requested action: ' + agent.action));
});
