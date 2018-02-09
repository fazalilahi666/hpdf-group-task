var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('./config');
var Wit = require('node-wit').Wit;
const NewsAPI = require('newsapi');
var config = require('./config');

let FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
let FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
let FACEBOOK_SEND_MESSAGE_URL = 'https://graph.facebook.com/v2.6/me/messages?access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN;
const accessToken = process.env.WIT_ACCESS_TOKEN;
const newOrg_API_KEY = process.env.NEWS_API_KEY;
const newsapi = new NewsAPI(newOrg_API_KEY);
const hasura_data_key = process.env.HASRA_DATA_KEY;

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

router.route("/").get(function (req, res) {
  res.send("Hi! I am a news bot.")
})

router.get('/webhook/', function (req, res) {
  console.log("fb verify token...", FACEBOOK_VERIFY_TOKEN);
  if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
    return;
  }
  res.send('Error, wrong token')
});

// response to sent user      
var defaultResponse = `Sorry! i could not get you. You can search for news by category, location or do a random search. Try again!:)`;

// get casual intent response from hasura data api
var getIntentResponse = function (intent) {
  var selectOptions = {
    url: config.projectConfig.url.data,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": hasura_data_key
    },
    body: JSON.stringify({
      "type": "run_sql",
      "args": {
        "sql": "select response from rand_intent_response where intent = '" + intent + "' order by random() limit 1"
      }
    })
  }
  return request(selectOptions).then(function (response) {
    var resp = JSON.parse(response);
    return resp.result[1][0];
  }).catch(function (err) {
    console.log('API call failed...', err);
    return err;
  });
}

// return promises related to hasura ie. data/auth api
function hasuraPromise(casualIntent, country) {
  if (casualIntent != "") {
    // promise for getting casual intent response
    return new Promise(function (resolve, reject) {
      return getIntentResponse(casualIntent).then(resp => {
        return resolve(resp);
      })
    });
  }
}

router.post('/webhook/', function (req, res) {
  console.log(JSON.stringify(req.body));
  if (req.body.object === 'page') {
    if (req.body.entry) {
      req.body.entry.forEach(function (entry) {
        if (entry.messaging) {
          entry.messaging.forEach(function (messagingObject) {
            var senderId = messagingObject.sender.id;
            if (messagingObject.message) {
              if (!messagingObject.message.is_echo) {
                var msgText = messagingObject.message.text;
                console.log(`got text message from chat...  ${msgText}`);
                const client = new Wit({ accessToken: accessToken });
                var userIntent;
                // make wit request
                client.message(msgText)
                  .then((witRes) => {
                    console.log(`got wit response...  ${witRes}`);
                    // get user intent from wit
                    userIntent = firstEntityValue(witRes.entities, 'intent');
                    // get user greetings from user if any
                    const greeting = firstEntityValue(witRes.entities, 'greetings');
                    // get news source/publisher, set google news as default
                    const newsSource = firstEntityValue(witRes.entities, 'news_source') || 'google_news_in';
                    // get news category, set general by default
                    const newsCategory = firstEntityValue(witRes.entities, 'news_category');
                    // get news source country, set india as default
                    const newsLocation = firstEntityValue(witRes.entities, 'location');
                    // get any phrase searched for
                    const phraseSrch = firstEntityValue(witRes.entities, 'wikipedia_search_query');

                    if (!userIntent) {	// no intent, fallback
                      res.send(defaultResponse);
                    }
                    else {
                      //take action based on intent          
                      switch (userIntent) {
                        case 'random_search':
                        case 'get_headlines':
                          getNews(senderId, newsCategory, newsLocation, phraseSrch, userIntent);
                          break;
                        case 'user_greeted':
                          // get casual intent greeting response
                          hasuraPromise('user_greeted', '').then(function (botResp) {
                            sendMessageToUser(senderId, botResp);
                          });
                          break;
                        case 'user_thanked':
                          // get casual intent thank response
                          hasuraPromise('user_thanked', '').then(function (botResp) {
                            sendMessageToUser(senderId, botResp);
                          });
                          break;
                        case 'user_left':
                          // get casual intent left response
                          hasuraPromise('user_left', '').then(function (botResp) {
                            sendMessageToUser(senderId, botResp);
                          });
                          break;
                        default:
                          console.log(`userintent...  ${userIntent}`);
                          sendMessageToUser(senderId, defaultResponse);
                          break;
                      }
                    }
                  })
                  .catch((err) => {
                    console.log(`wit API call failed!....${err}`)
                    res.send(defaultResponse);
                  })
              }
            } else if (messagingObject.postback) {
              console.log('Received Postback message from ' + senderId);
            }
          });
        } else {
          console.log('Error: No messaging key found');
        }
      });
    } else {
      console.log('Error: No entry key found');
    }
  } else {
    console.log('Error: Not a page object');
  }
  res.sendStatus(200);
})

function getElementObject(article) {
  var title = article.title;
  var description = article.description;
  var urlToImage = article.urlToImage;
  var articleSource = article.url;
  return {
    title: title,
    subtitle: description,
    image_url: urlToImage,
    buttons: [
      {
        type: "web_url",
        url: articleSource,
        title: "Read More"
      }
    ]
  }
}

function sendUIMessageToUser(senderId, elementList) {
  request({
    url: FACEBOOK_SEND_MESSAGE_URL,
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: elementList
          }
        }
      }
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending UI message to user: ' + error.toString());
    } else if (response.body.error) {
      console.log('Error sending UI message to user: ' + JSON.stringify(response.body.error));
    }
  });
}

function sendMessageToUser(senderId, message) {
  request({
    url: FACEBOOK_SEND_MESSAGE_URL,
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      }
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message to user: ' + error);
    } else if (response.body.error) {
      console.log('Error sending message to user: ' + response.body.error);
    }
  });
}

function showTypingIndicatorToUser(senderId, isTyping) {
  var senderAction = isTyping ? 'typing_on' : 'typing_off';
  request({
    url: FACEBOOK_SEND_MESSAGE_URL,
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      sender_action: senderAction
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending typing indicator to user: ' + error);
    } else if (response.body.error) {
      console.log('Error sending typing indicator to user: ' + response.body.error);
    }
  });
}

function getNews(senderId, newsCategory, newsLocation, phraseSrch, userIntent) {
  showTypingIndicatorToUser(senderId, true);
  var fetchUrl = {
    category: newsCategory,
    language: 'en',
    country: newsLocation != null ? newsLocation : 'in'
  };
  var randomSearch = { q: phraseSrch };
  fetchUrl = userIntent === "random_search" ? randomSearch : fetchUrl;
  newsapi.v2.topHeadlines(fetchUrl).then(response => {
    showTypingIndicatorToUser(senderId, false);
    //console.log("response from wit...",response);
    if (response.articles) {
      if (response.articles.length > 0) {
        var elements = []
        var resultCount = response.articles.length > 15 ? 15 : response.articles.length;
        for (i = 0; i < resultCount; i++) {
          var article = response.articles[i];
          elements.push(getElementObject(article));
        }
        sendMessageToUser(senderId, 'Hey i found something on ' + phraseSrch);
        console.log("articles as response...", elements);
        sendUIMessageToUser(senderId, elements);
      } else {
        sendMessageToUser(senderId, 'Could not find any information on ' + phraseSrch);
      }
    } else {
      sendMessageToUser(senderId, defaultResponse);
    }
  });
}
module.exports = router;