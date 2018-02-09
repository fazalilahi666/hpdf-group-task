var express = require('express');
var router = express.Router();
var request = require('request-promise');
var Wit = require('node-wit').Wit;
var NewsAPI = require('newsapi');
var config = require('./config');

const accessToken = process.env.WIT_ACCESS_TOKEN;
const newOrg_API_KEY = process.env.NEWS_API_KEY;
const hasura_data_key = process.env.HASRA_DATA_KEY;
const newsapi = new NewsAPI(newOrg_API_KEY);

// response to sent user      
var defaultResponse = `Sorry! i could not get you. You can search for news by category,location or do a random search. Try again!:)`;

// extracts intents/entities from the entities object
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

// to form object that id finally sent as response from bot
function getElementObject(article) {
    var title = article.title;
    var description = article.description;
    var urlToImage = article.urlToImage;
    var articleSource = article.url;
    return {
        title: title,
        subtitle: description,
        imageUrl: urlToImage,
        articleSource: articleSource
    }
}

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

// method to get news for the intents/entities recieved from wit
var getNews = function (newsCategory, newsLocation, phraseSrch, userIntent) {
    var fetchUrl = {
        category: newsCategory,
        language: 'en',
        country: newsLocation != null ? newsLocation : 'in'
    };
    var randomSearch = { q: phraseSrch };
    // do random search if intent is random_search
    fetchUrl = userIntent === "random_search" ? randomSearch : fetchUrl;
    console.log("fetchUrl in getNews...", fetchUrl);
    return newsapi.v2.topHeadlines(fetchUrl).then(response => {
        console.log(response);
        if (response.articles) {
            if (response.articles.length > 0) {
                console.log(`got articles...  ${response.articles}`);
                var elements = []
                // get count of articles to send
                var resultCount = response.articles.length > 10 ? 10 : response.articles.length;
                for (i = 0; i < resultCount; i++) {
                    var article = response.articles[i];
                    elements.push(getElementObject(article));
                }
                return elements;
            } else {
                console.log(`Could not find any information on ' + ${phraseSrch}`);
                return 'Could not find any information on ' + phraseSrch;
            }
        } else {
            return defaultResponse;
        }
    });
}

function getNewsInfo(newsCategory, newsLocation, phraseSrch, userIntent) {
    return new Promise(function (resolve, reject) {
        return getNews(newsCategory, newsLocation, phraseSrch, userIntent).then(news => {
            return resolve(news);
        })
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

router.route("/").get(function (req, res) {
    res.send("Hi! I am a news bot.")
})

router.route("/get-news").post(function (req, res) {
    const client = new Wit({ accessToken: accessToken });
    const userQuery = req.body.getNews;
    console.log(`got userQuery...  ${userQuery}`);
    var userIntent;
    // make wit request
    client.message(userQuery)
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
                console.log(`no intent...falling back with default response`);
                res.send(defaultResponse);
            }
            else {
                //take action based on intent   
                console.log(`witRes.entities...  ${witRes.entities}`);
                //res.status(200).json({ success: true, "data": witRes.entities });
                switch (userIntent) {
                    case 'random_search':
                    case 'get_headlines':
                        getNewsInfo(newsCategory, newsLocation, phraseSrch, userIntent).then(function (news) {
                            res.status(200).json({ success: true, "data": news })
                        })
                        break;
                    case 'user_greeted':
                        // get casual intent greeting response
                        hasuraPromise('user_greeted', '').then(function (botResp) {
                            res.status(200).json({ success: true, "data": botResp });
                        });
                        break;
                    case 'user_thanked':
                        // get casual intent thank response
                        hasuraPromise('user_thanked', '').then(function (botResp) {
                            res.status(200).json({ success: true, "data": botResp });
                        });
                        break;
                    case 'user_left':
                        //get casual intent left response
                        hasuraPromise('user_left', '').then(function (botResp) {
                            res.status(200).json({ success: true, "data": botResp });
                        });
                        break;
                    default:
                        console.log(`userintent...  ${userIntent}`);
                        res.status(200).json({ success: true, "data": defaultResponse });
                        break;
                }
            }
        })
        .catch((err) => {
            console.log(`wit API call failed!....${err}`)
            res.send(defaultResponse);
        })
})
module.exports = router;