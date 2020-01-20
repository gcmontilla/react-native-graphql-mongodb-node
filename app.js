const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { graphql, buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

const schema = `
    type RootQuery {
        events: [String!]!
    }

    type RootMutation {
        createEvent(name: String): String
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`;

app.use('/graphql', graphqlHttp({
    schema: buildSchema(schema),
    rootValue: {
        events: () => {
            return ['test', 'test-2']
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}));

app.listen(3000);

