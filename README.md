# Baby Sleep Tracker

This is an app I created when me an dmy wife were worried about my newborn daughters sleep cycle. 
It's a PWA built using React and GraphQL.

## How it works

The app is coded so that both my wife and I could use the app independently on our phones. First I coded the backend with Apollo Client listener, but since the app is hosted on a free Heroku dyno, it did not work. So I decided to get the client querying the DB constantly (so that changes in my phone would quickly display on my wife's phone and vice-versa).

When you open the app, you will see a large button, a description of "baby's state" (awake or sleeping) and a timer of how long the baby is on that state. On clicking the button, the state changes, the data is saved ant the timer reset.

## Functionalities and TO DO's

Right now the apps collects data and stores it at a MongoDB. After a while we got confortable with our baby's sleep cycle, so this project staled.

It would be nice to get a page for viewing the data, which got started but never finished. The way date-time are handled is still sketchy, as well.


