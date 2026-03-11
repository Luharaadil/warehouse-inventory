import https from 'https';

function fetchUrl(url) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchUrl(res.headers.location);
    } else {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        if (data.split('\n').length > 5) {
          console.log(data.split('\n').slice(0, 5).join('\n'));
          process.exit(0);
        }
      });
    }
  });
}

fetchUrl('https://docs.google.com/spreadsheets/d/1gQN98nrZx0HYfqXE35_HVjxMy0Y7XVXD/export?format=csv&gid=1029866475');
