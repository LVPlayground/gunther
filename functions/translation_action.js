// Copyright 2020 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const { Translate } = require('@google-cloud/translate').v2;

// The supported languages, this should be mostly comprehensive for the languages supported by
// Google Translate. The destination language must be known, but source language can be guessed.
const kLanguageMapping = new Map([
    [ 'dutch', 'nl' ],
    [ 'nederlands', 'nl' ],

    [ 'english', 'en' ],
    [ 'inglesa', 'en' ],
    [ 'inglés', 'en' ],
    [ 'ingles', 'en' ],

    [ 'spanish', 'es' ],
    [ 'español', 'es' ],
    [ 'espanol', 'es' ],

    [ 'afrikaans', 'af' ],
    [ 'albanian', 'sq' ],
    [ 'amharic', 'am' ],
    [ 'arabic', 'ar' ],
    [ 'armenian', 'hy' ],
    [ 'azerbaijani', 'az' ],
    [ 'basque', 'eu' ],
    [ 'belarusian', 'be' ],
    [ 'bengali', 'bn' ],
    [ 'bosnian', 'bs' ],
    [ 'bulgarian', 'bg' ],
    [ 'catalan', 'ca' ],
    [ 'cebuano', 'ceb' ],
    [ 'chichewa', 'ny' ],
    [ 'corsican', 'co' ],
    [ 'creole', 'ht' ],
    [ 'croatian', 'hr' ],
    [ 'czech', 'cs' ],
    [ 'danish', 'da' ],
    [ 'esperanto', 'eo' ],
    [ 'estonian', 'et' ],
    [ 'filipino', 'tl' ],
    [ 'finnish', 'fi' ],
    [ 'french', 'fr' ],
    [ 'frisian', 'fy' ],
    [ 'galician', 'gl' ],
    [ 'georgian', 'ka' ],
    [ 'german', 'de' ],
    [ 'greek', 'el' ],
    [ 'gujarati', 'gu' ],
    [ 'hausa', 'ha' ],
    [ 'hawaiian', 'haw' ],
    [ 'hebrew', 'iw' ],
    [ 'hindi', 'hi' ],
    [ 'hmong', 'hmn' ],
    [ 'hungarian', 'hu' ],
    [ 'icelandic', 'is' ],
    [ 'igbo', 'ig' ],
    [ 'indonesian', 'id' ],
    [ 'irish', 'ga' ],
    [ 'italian', 'it' ],
    [ 'japanese', 'ja' ],
    [ 'javanese', 'jw' ],
    [ 'kannada', 'kn' ],
    [ 'kazakh', 'kk' ],
    [ 'khmer', 'km' ],
    [ 'kinyarwanda', 'rw' ],
    [ 'korean', 'ko' ],
    [ 'kurdish', 'ku' ],
    [ 'kyrgyz', 'ky' ],
    [ 'lao', 'lo' ],
    [ 'latin', 'la' ],
    [ 'latvian', 'lv' ],
    [ 'lithuanian', 'lt' ],
    [ 'luxembourgish', 'lb' ],
    [ 'macedonian', 'mk' ],
    [ 'malagasy', 'mg' ],
    [ 'malay', 'ms' ],
    [ 'malayalam', 'ml' ],
    [ 'maltese', 'mt' ],
    [ 'maori', 'mi' ],
    [ 'marathi', 'mr' ],
    [ 'mongolian', 'mn' ],
    [ 'myanmar', 'my' ],
    [ 'nepali', 'ne' ],
    [ 'norwegian', 'no' ],
    [ 'odia', 'or' ],
    [ 'pashto', 'ps' ],
    [ 'persian', 'fa' ],
    [ 'polish', 'pl' ],
    [ 'portuguese', 'pt' ],
    [ 'punjabi', 'pa' ],
    [ 'romanian', 'ro' ],
    [ 'russian', 'ru' ],
    [ 'samoan', 'sm' ],
    [ 'gaelic', 'gd' ],
    [ 'serbian', 'sr' ],
    [ 'sesotho', 'st' ],
    [ 'shona', 'sn' ],
    [ 'sindhi', 'sd' ],
    [ 'sinhala', 'si' ],
    [ 'slovak', 'sk' ],
    [ 'slovenian', 'sl' ],
    [ 'somali', 'so' ],
    [ 'sundanese', 'su' ],
    [ 'swahili', 'sw' ],
    [ 'swedish', 'sv' ],
    [ 'tajik', 'tg' ],
    [ 'tamil', 'ta' ],
    [ 'tatar', 'tt' ],
    [ 'telugu', 'te' ],
    [ 'thai', 'th' ],
    [ 'turkish', 'tr' ],
    [ 'turkmen', 'tk' ],
    [ 'ukrainian', 'uk' ],
    [ 'urdu', 'ur' ],
    [ 'uyghur', 'ug' ],
    [ 'uzbek', 'uz' ],
    [ 'vietnamese', 'vi' ],
    [ 'welsh', 'cy' ],
    [ 'xhosa', 'xh' ],
    [ 'yiddish', 'yi' ],
    [ 'yoruba', 'yo' ],
    [ 'zulu', 'zu' ],
]);

// The Firebase Project ID as which Gunther is running, which has access to the Translate API.
const kProjectId = 'lvp-gunther';

// Handler for translation actions. The given |agent| is a WebhookClient instance, documented here:
// https://github.com/dialogflow/dialogflow-fulfillment-nodejs/blob/master/src/dialogflow-fulfillment.js#L39
exports.translationAction = async function(agent) {
    const context = agent.context.get('translate-text') || { parameters: {} };
    const parameters = agent.parameters || {};

    const translateService = new Translate({
        projectId: kProjectId,
    });

    // (1) Determine the |languageDestination|, |languageSource| and |text| of the translation
    // request. These are either given as arguments or in the conversation's context.
    let languageDestination = parameters['lang-to'];
    let languageSource = parameters['lang-from'];
    let text = parameters['text'];

    if (!languageDestination && context.parameters.hasOwnProperty('lang-to'))
        languageDestination = context.parameters['lang-to'];

    if (!languageSource && context.parameters.hasOwnProperty('lang-from'))
        languageSource = context.parameters['lang-from'];

    if (!text && context.parameters.hasOwnProperty('text'))
        text = context.parameters['text'];

    // (2) Store the current conversation context based on the combination of parameters and the
    // existing context. This allows questions to be answered by the player.
    agent.context.set('translate-text', 2, {
        'lang-to': languageDestination,
        'lang-from': languageSource,
        'text': text,
    });

    console.log(JSON.stringify({ languageDestination, languageSource, text }));

    // (3) The |languageDestination| and |text| are required. If they're not available, then Gunther
    // should ask the player to clarify them through follow-up questions.
    if (!text) {
        agent.add('What text would you like to translate, @{nickname}?');
        return true;
    }

    if (!languageDestination) {
        agent.add('To what language would you like that translated, @{nickname}?');
        return true;
    }

    // (4) Similarly, verify that both the |languageSource| and |languageDestination| are actually
    // understood by our mapping, as we need to pass a language code to the Google Translate API.
    const normalizedLanguageDestination = languageDestination.toLowerCase();
    const normalizedLanguageSource = (languageSource || '').toLowerCase();

    if (!kLanguageMapping.has(normalizedLanguageDestination)) {
        agent.add(`Sorry, I don't know what language ${languageDestination} is, @{nickname}.`);
        return true;
    }

    if (languageSource && !kLanguageMapping.has(normalizedLanguageSource)) {
        agent.add(`Sorry, I don't know what language ${languageSource} is, @{nickname}.`);
        return true;
    }

    // (5) Finally, now that everything has been verified, build the options for the Google
    // Translate API call based on the available information.
    const options = {
        to: kLanguageMapping.get(normalizedLanguageDestination)
    };

    if (languageSource)
        options.from = kLanguageMapping.get(normalizedLanguageSource);

    // (6) Actually call the Google Translate API. This is asynchronous, and will communicate the
    // results through settling a promise. Translations can fail - add a catch handler too.
    try {
        const [ translation ] = await translateService.translate(text, options);
        if (translation && translation.length) {
            agent.add(`${translation}, @{nickname}`);
        } else {
            agent.add(`Sorry {nickname}, I don't know how to translate that yet.`);
        }

    } catch (error) {
        console.log(JSON.stringify(error));
        agent.add('Sorry {nickname}, the translation service is currently unavailable.');
    }
}
