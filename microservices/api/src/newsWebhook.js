var express = require('express');
var router = express.Router();
var Wit = require('node-wit').Wit;
var NewsAPI = require('newsapi');

const accessToken = process.env.WIT_ACCESS_TOKEN;
const newOrg_API_KEY = process.env.NEWS_API_KEY;
const newsapi = new NewsAPI(newOrg_API_KEY);

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

// method to get news for the intents/entities recieved from wit
var getNews =  function(newsCategory, newsLocation, phraseSrch, userIntent) {
    var fetchUrl = {
        category: newsCategory,
        language: 'en',
        country: 'in'
    };
    var randomSearch = { q: phraseSrch };
    // do random search if intent is random_search
    fetchUrl = userIntent === "random_search" ? randomSearch : fetchUrl;
    console.log(`fetchUrl in getNews...  ${fetchUrl}`);
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
                console.log(`Could not find any informationg on ' + ${phraseSrch}`);
                return 'Could not find any informationg on ' + phraseSrch;
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

router.route("/").get(function (req, res) {
    res.send("Hi! I am a news bot.")
})

router.route("/get-news").post(function (req, res) {
    const client = new Wit({ accessToken: accessToken });
    const userQuery = req.body.testInput;
    console.log(`got userQuery...  ${userQuery}`);
    var userIntent;

    // response to sent user      
    var defaultResponse = `Sorry! i could not get you. You can search for news by category,location or do a random search. Try again!:)`;

    // make wit request
    client.message(userQuery)
        .then((witRes) => {
            console.log(`got wit response...  ${witRes}`);
            // get user intent from wit
            userIntent = firstEntityValue(witRes.entities, 'intent');
            // get user greetings from user if any
            const greeting = firstEntityValue(witRes.entities, 'greetings') || {};
            // get news source/publisher, set google news as default
            const newsSource = firstEntityValue(witRes.entities, 'news_source') || 'google_news_in';
            // get news category, set general by default
            const newsCategory = firstEntityValue(witRes.entities, 'news_category') || 'general';
            // get news source country, set india as default
            const newsLocation = firstEntityValue(witRes.entities, 'location') || 'in';
            // get any phrase searched for
            const phraseSrch = firstEntityValue(witRes.entities, 'local_search_query') || {};

            if (!userIntent) {	// no intent, fallback
                console.log(`no intent...falling back with default response`);
                res.send(defaultResponse);
            }
            else {
                //take action based on intent   
                console.log(`witRes.entities...  ${witRes.entities}`);
                res.status(200).json({ success: true, "data": witRes.entities });       
                // switch (userIntent) {
                //     case 'random_search':
                //     case 'get_headlines':
                //     getNewsInfo(newsCategory, newsLocation, phraseSrch, userIntent)
                //         .then(function (news) {
                //             res.status(200).json({ success: true, "data": news })
                //         })
                //         .catch(function (err) {
                //             res.status(200).json({ success: true, "data": err })
                //         });
                //     break;
                //     case 'user_greeted':
                //         res.status(200).json({ success: true, "data": `Hi. I am a News Bot. I can get you news by category or location. You can also do a random search.` });
                //         break;
                //     case 'user_thanked':
                //         res.status(200).json({ success: true, "data": `My Pleasure. Always!` });
                //     //res.send(`My Pleasure. Always!`);
                //     case 'user_left':
                //         res.status(200).json({ success: true, "data": `See you again.` });
                //         break;
                //     default:
                //         console.log(`userintent...  ${userIntent}`);
                //         res.status(200).json({ success: true, "data": defaultResponse });
                //         break;
                // }
            }
        })
        .catch((err) => {
            console.log(`wit API call failed!....${err}`)
            res.send(defaultResponse);
        })
})
module.exports = router;