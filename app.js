const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { graphql, buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

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
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event
                .save()
                .then(result => {
                    console.log(result);
                    return {...result._doc};
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        },
        createUser: args => {
            User.findOne({email: args.userInput.email})
                .then(user => {
                    if (user) {
                        throw new Error('Email already taken!');
                    }
                    return bcrypt.hash(args.userInput.password, 12);
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user
                        .save()
                        .then(result => {
                            console.log(result);
                            return {...result._doc, password: null, _id: result.id};
                        })
                        .catch(err => {
                            console.log(err);
                            throw err;
                        });
                })
                .catch(err => {
                    throw err;
                });
            
            
        }
    },
    graphiql: true
}));

// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@react-native-graphql-mongodb-node-fxqz8.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false')
.then(() => {
    app.listen(3000);
})
.catch(err => {
    console.log(err)
})