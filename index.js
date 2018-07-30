'use strict'

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/discover/movie?';
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';


// Dates for the Movie API call
const today = new Date();
const fullISODate = today.toISOString();
const ISODate = fullISODate.substr(0,10);

console.log(today);

// const monthAgo = ISODate.setMonth(ISODate.getMonth() - 1);


console.log(ISODate);
// lets begin event

function handleBeginButton() {
  $('.js-begin').on('click', event=>{
    event.preventDefault();
    renderBeginResults();
    });
}

function renderBeginResults() {
  $('.js-search-form').prop('hidden', false);
  $('header').html("<h1>Dinner and a Movie Chooser</h1>");
  $('.explaination').prop('hidden', true);
  $('.js-begin').prop("hidden", true);
}


//From TMDB API
const idToGenre = {
  27: 'horror',
  18: 'drama',
  10749: 'romantic',
  35: 'comedy',
  10751: 'family',
  28: 'action'
}


// Created pairs of genre and food
const genreToFoodCatagory = {
  horror: 'comfort food',
  drama: 'american',
  romantic: 'french',
  comedy: 'burger joint',
  family: 'pizza',
  action: 'diner'
};

function getDataFromTMDBApi(genreId, callback) {
  const query = {
    with_genres: `${genreId}`,
    api_key: '0d004f603b5e46bc91ac76e45f1a3078',
    'primary_release_date.gte':'2018-06-22',
    'primary_release_date.lte':`${ISODate}`,
    sort_by: 'popularity.desc',
  }
  $.getJSON(TMDB_SEARCH_URL, query, callback);
}


function getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, callback){
  const query = {
    client_id: 'K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD',
    client_secret: 'AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS',
    near: `${zipCode}`,
    query: `restaurant, ${restaurantCatagory}`,
    v: '20180323',
    limit: 3,
  }
  $.getJSON(FOURSQUARE_SEARCH_URL, query, callback);
}


function renderMovieResult(result) {
  return `
  <div>
    <h3>${result.title}</h3>
    <p>${result.overview}</p>
  </div>
  `;
}

//<img src="'http://image.tmdb.org/t/p/w185/' + '${result.poster_path}'"  alt=''>

function renderRestaurantResult(result) {
  return `
  <div>
    <h3>${result.venue.name}</h3>
    <p>${result.venue.location.formattedAddress[0]}</p>
    <p></p>
  </div>
  `;
}

function displayTMDBSearchData(data) {
  const topThree = data.results.slice(0,3);
  const results = topThree.map((item, index)=>renderMovieResult(item));
  $('.js-movie-result').html(results);
  console.log('movie');
  console.log(data);
}

function displayFOURSQUARESearchData(data) {
  const groupsObj = data.response.groups[0];
  const results = groupsObj.items.map((item, index)=>renderRestaurantResult(item));
  $('.js-restaurant-result').html(results);
  console.log(data);
}

function watchSubmit () {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    let genreQueryTarget = $(event.currentTarget).find("input[type='radio']:checked");
    const genreId = genreQueryTarget.val();
    const genre = idToGenre[genreId];
    console.log(genre);
    getDataFromTMDBApi(genreId, displayTMDBSearchData);

    let zipCodeQueryTarget = $(event.currentTarget).find('.js-zip-code-query');
    const zipCode = zipCodeQueryTarget.val();
    const restaurantCatagory = genreToFoodCatagory[genre];
    getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, displayFOURSQUARESearchData);

    $('.js-movie-result').prop('hidden', false);
    $('.js-restaurant-result').prop('hidden', false);
    $('.restart').prop('hidden', false);

    $('form').prop('hidden', true);

  });
}

//handle restarting the app

function handleAppRestart(){
  $('.restart').on('click', function(){
    $('.js-movie-result').prop('hidden', true);
    $('.js-restaurant-result').prop('hidden', true);
    $('.restart').prop('hidden', true);
    $('.js-search-form').prop('hidden', true);
    $('header').html("<h1>Welcome to the Dinner and a Movie Chooser</h1>");
    $('.explaination').prop('hidden', false);
    $('.js-begin').prop("hidden", false);

  })
}

$(handleAppRestart);
$(handleBeginButton);
$(watchSubmit);