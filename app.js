const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { graphql, buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

const events = [];

app.use(bodyParser.json());

const schema = `
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type User {
        _id: ID!
        email: String!
        password: String
    }

    input UserInput {
        email: String!
        password: String!
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`;

app.use(
    '/graphql', 
    graphqlHttp({
    schema: buildSchema(schema),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: args.date
            };
            events.push(event);
            return event;
        },
        createUser: (args) => {
            const user = {
                _id:
            }
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false`)
.then(() => {
    app.listen(3000);
})
.catch(err => {
    console.log(err)
})