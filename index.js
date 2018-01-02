const co = require('co');
const request = require('superagent');

const retryIntervall = 2000; // In ms
const maxRetries = 100;
const defaultRefreshInterval = 600000; // In ms
const defaultHost = process.env.I18N_API_HOST || 'http://i18n_api:3000/applications/i18n';

let intervalHandle;
let dictionaryCache = null;
let language;

const loadDictionary = function loadDictionary(i18nApi) {
  return new Promise((resolve, reject) => {
    request
      .get(i18nApi)
      .end((err, res) => {
        if (err) {
          if (err.status === 401) {
            reject(err.response.text);
            return;
          }
          console.warn(`Couldn't connect to i18n API. Error: ${err.message}`);
          setTimeout(() => {
            resolve(null);
          }, retryIntervall);
          return;
        }
        resolve(res);
      });
  });
};

const getDictionary = co.wrap(function* getDictionary(apiHost) {
  let retries = maxRetries;
  let response = null;
  /* eslint no-plusplus: off */
  while (response == null && retries-- > 0) {
    console.info(`Connecting to ${apiHost}... (${retries} attempts left)`);
    response = yield loadDictionary(apiHost);
  }

  if (response == null) {
    console.error(`Couldn't connect to i18n API after ${maxRetries} attempts`);
    throw Error('Could not connect to i18n API');
  }

  return response.body;
});

const updateDictionaryCache = function updateDictionaryCache(apiHost) {
  return getDictionary(apiHost).then((dictionary) => {
    dictionaryCache = dictionary;

    return dictionaryCache;
  });
};
/* eslint arrow-body-style: off */
module.exports = {
  init: function init(apiHost = defaultHost, lang = undefined, refreshInterval = defaultRefreshInterval) {
    language = lang;
    return updateDictionaryCache(apiHost).then((dictionary) => {
      intervalHandle = setInterval(() => updateDictionaryCache, refreshInterval);
      console.info(`Phrases loaded from ${apiHost})`);
      return dictionary;
    }, (err) => {
      console.log('Error getting i18n dictionary', err);
      throw new Error(err);
    });
  },
  get: (key) => {
    if (!dictionaryCache) {
      throw new Error('You must run init before getting values');
    }

    if (!key) {
      return dictionaryCache;
    }
    const matches = dictionaryCache.filter(f => {
      return f.key == key;
    });
    

    if (matches.length) {
      return language ? matches[0][language] : matches[0];
    }
    return undefined;
  },

  stopRefresh: () => {
    if (intervalHandle) {
      clearInterval(intervalHandle);

      intervalHandle = null;
    }
  },
};
