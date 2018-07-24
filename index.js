'use strict'

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/discover/movie?';
const YELP_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';

function getDataFromTMDBApi (searchTerm, callback){
  const query = {
    with_genres: `${searchTerm}`,
    api_key: '0d004f603b5e46bc91ac76e45f1a3078',
    'primary_release_date.gte':'2018-06-22',
    'primary_release_date.lte':'2018-07-22',
    sort_by: 'popularity.desc'
  }
  $.getJSON(TMDB_SEARCH_URL, query, callback);
}

function getDataFromYELPApi (searchTerm, callback){
  const query = {
    client_id: 'K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD',
    client_secret: 'AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS',
    near: `${searchTerm}`,
    query: 'coffee',
    v: '20180323',
    limit: 1
  }
  $.getJSON(YELP_SEARCH_URL, query, callback);
}


//https://api.foursquare.com/v2/venues/explore?client_id=K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD&client_secret=AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS&ll=40.7243,-74.0018&query=coffee&v=20180323&limit=1

function renderMovieResult (result) {
  return `
  <div>
    <h2>${result.title}</h2>
    <p>${result.overview}</p>
  </div>
  `;
}

function renderRestaurantResult (result) {
  return `
  <div>
    <h2>${result.venue.name}</h2>
    <p></p>
  </div>
  `;
}

function displayTMDBSearchData(data) {
  const topThree = data.results.slice(0,3);
  const results = topThree.map((item, index)=>renderMovieResult(item));
  $('.js-movie-result').html(results);
}

function displayYELPSearchData(data) {
  const groupsObj = data.response.groups[0];
  const topThree = groupsObj.items.slice(0,3)
  const results = topThree.map((item, index)=>renderRestaurantResult(item));
  //render result
  $('.js-restaurant-result').html(results);
}

function watchSubmit () {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    let genreQueryTarget = $(event.currentTarget).find('.js-genre-query');
    const genre = genreQueryTarget.val();
    getDataFromTMDBApi(genre, displayTMDBSearchData);

    let zipCodeQueryTarget = $(event.currentTarget).find('.js-zip-code-query');
    const zipCode = zipCodeQueryTarget.val();
    getDataFromYELPApi(zipCode, displayYELPSearchData);
    console.log(zipCode);

  });
}

$(watchSubmit);