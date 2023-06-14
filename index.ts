import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use(cors());
app.set('port', process.env.PORT || 1995);

import Cat from './src/router/cat'


// Connect to MongoDB

mongoose.connect(
  `mongodb+srv://fahadsamara:BJ7lSBccPC11YxxU@cluster0.1rcjnbu.mongodb.net/?retryWrites=true&w=majority`
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.info('Database connected');
});



app.get('/', (req, res, ) => {
    res.send('<h1>Hello world<h1>');
})

app.use('/cat', Cat);

app.listen(app.get('port'), () => {
    console.info(`Server listen on port ${app.get('port')}`);
})