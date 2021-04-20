const express = require('express');
const path = require('path');
const got = require('got');

const app = express();
const port = process.env.PORT || 5000;
const apiPrefix = 'https://www.metaweather.com/api';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api/search/query/:query', async (req, res) => {
  try {
    const response = await got(apiPrefix + '/location/search/?query=' + req.params.query);
    res.send(response.body);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/search/lattlong/:lattlong', async (req, res) => {
  try {
    const response = await got(apiPrefix + '/location/search/?lattlong=' + req.params.lattlong);
    res.send(response.body);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/location/:woeid', async (req, res) => {
  try {
    const response = await got(apiPrefix + '/location/' + req.params.woeid);
    res.send(response.body);
  } catch (error) {
    res.status(500).send(error);
  }
});


if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
    
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));