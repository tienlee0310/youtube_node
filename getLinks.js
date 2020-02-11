const scrapy = require('node-scrapy')
const fetch = require('node-fetch')
const fs = require("fs")

const url = 'https://www.uta-net.com/song/2/'
const DOMAIN_ROOT = 'https://www.uta-net.com';

const page = {
    link1: '[itemprop="recordedAs"] a => href',
    link2: '[itemprop="lyricist"] a => href',
    link3: '[itemprop="composer"] a => href',
    link_movie: '.youtube_button a => href'
}

const button_youtube = {
    link_youtube: '#youtube_movie iframe => src'
}

getPageMovieFromButton(url);

//func get list link in page movie
function getPageMovieFromButton(url) {
  fetch(url)
  .then(res => res.text())
  .then(body => {
    let data = scrapy.extract(body, page);
    fs.writeFile('list_link.txt', JSON.stringify(data), function (err) {
        if (err) throw err;
        
        //request get link youtube
        let domain = DOMAIN_ROOT + data.link_movie;
        console.log("Page movie:" + domain)
        console.log('歌手：' + DOMAIN_ROOT + data.link1)
        console.log('作詞：' + DOMAIN_ROOT + data.link2)
        console.log('作曲：' + DOMAIN_ROOT + data.link3)
        getLinkYoutube(domain)

    });
  })
  .catch(console.error)
}

//func get link youtube
function getLinkYoutube(domain) {
  fetch(domain)
  .then(res => res.text())
  .then(body => {
      let data_youtube = scrapy.extract(body, button_youtube);
      fs.writeFile('link_youtube.txt', JSON.stringify(data_youtube), function (err) {
          if (err) throw err;
          console.log('Link youtube: ' + data_youtube.link_youtube);
      });
  })
  .catch(console.error)
}

  
