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
"read out to me from sports"
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

## Pre-requisites
* [Hasura CLI] (https://docs.hasura.io/0.15/manual/install-hasura-cli.html)
* [WIT API account](https://wit.ai/docs)

## Getting the project
Press the **Clone & Deploy** button above and follow the instructions.

## Make changes and deploy
To make changes to the project, browse to /microservices/api/src and edit the files according to your app.

* Create a wit [access token](https://wit.ai/) for your app and add it to hasura secrets.You can find your token in your app settings once you create the app

     ``` $ hasura secrets update bot.wit_access_token.key <your token> ```

* Create a NewsAPI [access token](https://newsapi.org/register) for your app and add it to hasura secrets

     ``` $ hasura secrets update bot.news_api_key.key <your token> ```

* Run 
```$ git add .```
, ```$ git commit -m "First commit"```
 and ```$ git push hasura master```

### You are done. 
You can now make post requests to the endpoint: **get-news**

#### Note: **post request body must contain the user query in "userQuery" parameter**

## Support
If you happen to get stuck anywhere, feel free to contact me at ebmsfazal@gmail.com. Alternatively, if you find a bug, you can raise an issue [here](https://github.com/fazalilahi666/hpdf-group-task/issues).

## Support

If you happen to get stuck anywhere, please mail me at ebmsfazal@gmail.com. Alternatively, if you find a bug, you can raise an issue [here](https://github.com/fazalilahi666/hpdf-group-task/issues).
