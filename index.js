import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Successful response.');
  });

app.listen(process.env.PORT, () => console.log("listening"));