'use strict'

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/discover/movie?';
const YELP_SEARCH_URL = 'https://api.yelp.com/v3/businesses/search';

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
  const settings = {
    url: YELP_SEARCH_URL,
    data: {
      term: 'restaurants',
      location: `${searchTerm}`
      },
    dataType: 'json',
    type: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ehxJJvvLmFr-IDfPqVZjlA0YDT3jvqiuIOIXzdgFR_vOGVUOk1YhPWNnw_KgI-nWhcQLKQScWrCDIl2DmZN5xdJUHxD7p8BKBhnlV1v5AYKHgUjWRR01nBY3K3pWW3Yx');
    },
    success: callback
    };

  $.ajax(settings);
}

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
    <h2>${result.name}</h2>
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
  console.log(data);
  const topThree = data.businesses.slice(0,3);
  const results = topThree.map((item, index)=>renderRestaurantResult(item));
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

//test