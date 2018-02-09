# WIT - Categorize User Input

## What is it?

A nodejs-backed webhook that infers intents and extracts entities from user query it recieves using WIT API.

## How it works?

### Workflow

You want to understand what your end-user wants to perform. For example:

Ask about the weather
Book a restaurant
Open the garage door
The problem is that there a millions of different ways to express a given intent. For instance, all the following expressions should be mapped to the same intent:

“What is the weather in Paris?”
“Give me the current weather in Paris”
“Is it sunny or rainy in Paris now?”

This is exactly what APIs like WIT come into picture.

Extending on this concept, this application categorizes queries related to getting news.
So queries like:
"Whats happening in sports" 
"red out to me from sports"
"get me news in sports"

will give 
#intent: 
get_headlines
#entities:
1. news_location = india(deafult,unless queried for)
2. news_category = sports

### Internal Implementation

1. When a user query is received by the webhook, it uses WIT to infer intents and entities (read about these on WIT docs).
2. the extracted intents and entities are then sent as response from the webhook

#This app currently contains the following intents it understands:
get_headlines : when user queries for fetching news by location or news category(sports,entertainment,business,general,health etc)
random_search : when user makes a random (eg. "premier league")
user_thanked : when user thanks (eg. "thank you")
user_greeted : when user greets (eg. "hi", "hey", "yo")
user_left : when user says "bye", "see you" etc.


## What does it use?

1. [Hasura](https://hasura.io)
2. [WIT API](https://wit.ai/docs)



## How do I use it?

1. Install [hasura CLI](https://docs.hasura.io/0.15/manual/install-hasura-cli.html)

2. clone the project and `cd` into it.

3. Create a wit [access token](https://developers.intercom.com/v2.0/reference#personal-access-tokens-1) for your and add it to hasura secrets as well.

```
$ hasura secret update chatbot.access.token <access_token>
```

4. Create a project on Wit (https://wit.ai/docs/recipes#categorize-the-user-intent) (it is free). You can find your token in your app settings once you create the app.

```
$ hasura secret update bot.wit_access_token.key <api_key>
```

5. Finally, deploy the webhook using git push. Run these commands from the project directory.

```
$ git add .
$ git commit -m "First commit"
$ git push hasura master
```

   You are done. You can make post requests to the endpoint:get-news
   ##Note: post body must contain the user query in "get-news" parameter

## How to build on top of this?

This webhook is written in Nodejs using the express framework. The source code lies in `microservices/api/src` directory. `webhook.js` is where you want to start modifying the code.

If you are using any extra packages, just add them to `microservices/api/src/package.json` and they will be installed during the build.

## Support

If you happen to get stuck anywhere, please mail me at ebmsfazal@gmail.com. Alternatively, if you find a bug, you can raise an issue [here](https://github.com/fazalilahi666/hpdf-group-task/issues).
