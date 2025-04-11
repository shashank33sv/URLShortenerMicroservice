require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory URL store
let urlDatabase = [];
let urlId = 1;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  try {
    const urlObj = new URL(url);

    // Check if URL uses http or https
    if (!/^https?:/.test(urlObj.protocol)) {
      return res.json({ error: 'invalid url' });
    }

    // Check DNS for hostname
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Store and return short url
        const shortUrl = urlId++;
        urlDatabase.push({ original_url: url, short_url: shortUrl });
        res.json({ original_url: url, short_url: shortUrl });
      }
    });

  } catch (err) {
    // Invalid URL structure
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urlDatabase.find(item => item.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
