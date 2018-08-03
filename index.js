'use strict'

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/discover/movie?';
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';

const FOURSQUARE_VENUE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/VENUE_ID'


// Dates for the Movie API call
const today = new Date();
const fullISODate = today.toISOString();
const ISODate = fullISODate.substr(0,10);

console.log(today);
console.log(ISODate);

function createDateMonthAgo() {
  const date = new Date(); 
  const todayAMonthAgo = date.setMonth(date.getMonth() -1);
  return date;    
  }
 
const fullISODateAMonthAgo = createDateMonthAgo().toISOString();
const ISODateAMonthAgo = fullISODateAMonthAgo.substr(0,10);
console.log(ISODateAMonthAgo);

// lets begin event
function renderBeginResults() {
  $('.js-search-form').prop('hidden', false);
  $('header').html("<h1>Dinner and a Movie Chooser</h1>");
  $('.initial-page').prop('hidden', true);
}

function handleBeginButton() {
  $('.js-begin').on('click', event=>{
    renderBeginResults();
    });
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
    'primary_release_date.gte':`${ISODateAMonthAgo}`,
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

function getDataFromFOURSQUAREVENUEApi(callback){
  const query = {
    VENUE_ID:'4c0bd0446071a5937ac3e132',
    client_id: 'K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD',
    client_secret: 'AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS',
    v: '20180323'
  }
  $.getJSON(FOURSQUARE_VENUE_SEARCH_URL, query, callback);
}


function renderMovieResult(result) {
  return `
  <div role='button' class='movie-results' data-summary='${result.overview}'>
    <h4>${result.title}</h4>
    <img src='http://image.tmdb.org/t/p/w154${result.poster_path}' alt=''>
  </div>
  `;
}

//<img src="'http://image.tmdb.org/t/p/w185/' + '${result.poster_path}'"  alt=''>

function renderRestaurantResult(result) {
  return `
  <div role='button' class='restaurant-results' data-address='${result.venue.location.formattedAddress[0]}' data-venueID='${result.venue.id}'>
    <h4>${result.venue.name}</h4>
    <h4></h4>
  </div>
  `;
}

function displayTMDBSearchData(data) {
  const topThree = data.results.slice(0,3);
  const results = topThree.map((item, index)=>renderMovieResult(item));
  $('.js-movie-result h3').append(results);
  console.log(data);
}

function displayFOURSQUARESearchData(data) {
  const groupsObj = data.response.groups[0];
  const results = groupsObj.items.map((item, index)=>renderRestaurantResult(item));
  $('.js-restaurant-result h3').append(results);
  console.log(data);
  // venueID = groupsObj.items.id;
  // console.log(venueID);
}

function showResultsinDOM(zipCode) {
  $('.results-section').prop('hidden', false)
  $('.restart').prop('hidden', false);
  
// collapse step 1
  // $('.genre-radio-button').not('.genre-selected').toggle('blind');
  $('.genre-radio-button').not('.genre-selected').hide();
  // $('form').toggle('top blind');
  $('.chosen-section').addClass('inputs-chosen');
  $('.chosen-section .choose-genre').html('Genre:');
  $('.chosen-section .choose-location').html('Location:');

  $("label[for='js-zip-code-query']").hide();
  $('.js-zip-code-query').replaceWith(zipCode);
  $('.js-search-form button').hide();


  $('.find-out-more').prop('hidden', false);
}



function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();

    let genreQueryTarget = $(event.currentTarget).find("input[type='radio']:checked");
    const genreId = genreQueryTarget.val();
    const genre = idToGenre[genreId];
    getDataFromTMDBApi(genreId, displayTMDBSearchData);

    let zipCodeQueryTarget = $(event.currentTarget).find('.js-zip-code-query');
    const zipCode = zipCodeQueryTarget.val();
    const restaurantCatagory = genreToFoodCatagory[genre];
    getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, displayFOURSQUARESearchData);

    showResultsinDOM(zipCode);


  });
}

//handle restarting the app

function handleAppRestart(){
  $('.restart').on('click', function(){
    $('.results-section').prop('hidden', true);
    $('.restart').prop('hidden', true);
    $('header').html("<h1>Welcome to the Dinner and a Movie Chooser</h1>");
    $('.initial-page').prop('hidden', false)
    $('.movie-results').remove();
    $('.restaurant-results').remove();
    $('.find-out-more').prop('hidden', true);
  })
}

//highlight chosen genre

function highlightChosenGenre(){
  $('.genre-radio-button').on('click', function(event){
    event.preventDefault();
    const targetGenre = $(event.currentTarget);
    const otherGenres = $('.genre-radio-button').not(targetGenre);
    otherGenres.removeClass('genre-selected');
    targetGenre.toggleClass('genre-selected')
    $(targetGenre).find('input').prop('checked', true);
  })
}

//Find out more functionallity

function handleFinalMovieSelect(){
  $('.js-movie-result').on('click', '.movie-results', function(event){
    event.preventDefault();
    const targetMovie = $(event.currentTarget);
    const otherMovies = $('.movie-results').not(targetMovie);
    otherMovies.removeClass('result-selected');
    targetMovie.toggleClass('result-selected');
  });
}

function handleFinalRestaurantSelect(){
  $('.js-restaurant-result').on('click', '.restaurant-results', function(event){
    event.preventDefault();
    const targetRestaurant = $(event.currentTarget);
    const otherRestaurants = $('.restaurant-results').not(targetRestaurant);
    otherRestaurants.removeClass('result-selected');
    targetRestaurant.toggleClass('result-selected');
  });
}

function handleCloseModal(){
  $('span').on('click', function(){
    $('.modal').css('display', 'none');
  })
}

function displayRestaurantMoreInfo() {
  $('.modal-content h3.restaurant').after(renderRestaurantMoreInfo());


}

function renderRestaurantMoreInfo() {
  const restaurantAddress = $('.restaurant-results.result-selected').data('address');
  const restaurantName = $('.restaurant-results.result-selected h4').html();
  let genreQueryTarget = $('form').find("input[type='radio']:checked");
  const genreId = genreQueryTarget.val();
  const genre = idToGenre[genreId];
  const restaurantCatagory = genreToFoodCatagory[genre];
  return `
  <div>
    <h4>${restaurantName}</h4>
    <p>${restaurantAddress}</p>
    <p>Known as one of your areas top ${restaurantCatagory} restaurants, we think this pairs best with a ${genre} movie</p>
  </div>
  `;
}

function  renderMovieMoreInfo() {
  const movieSummary = $('.movie-results.result-selected').data('summary');
  const movieTitle = $('.movie-results.result-selected h4').html();
  return `
  <div>
    <h4>${movieTitle}</h4>
    <p>${movieSummary}</p>
  </div>
  `;
}

function displayMovieMoreInfo() {
  $('.modal-content h3.movie').after(renderMovieMoreInfo());

}

function handleFindOutMore(){
  $('.find-out-more').on('click', function() {
    const movieChosen = $('.movie-results.result-selected h4').html();
    console.log(movieChosen);
    const restaurantChosen = $('.restaurant-results.result-selected h4').html();
    

    if ( (movieChosen !== undefined) || (restaurantChosen !== undefined) ) {
    //return just those two results
      console.log('both selected');
      $('.modal').css('display', 'block');
      handleCloseModal();
      displayMovieMoreInfo();
      displayRestaurantMoreInfo();
      

      const venueIDquery = $('result-selected').data('venueID');
      // getDataFromFOURSQUAREVENUEApi(renderRestaurantMoreInfo);



    } else {
      $('.find-out-more').before('<p>Please select one movie and one restaurant</p>');
  }});

}

function init() {
  $(handleCloseModal);
  $(handleAppRestart);
  $(handleBeginButton);
  $(watchSubmit);
  $(handleFinalMovieSelect);
  $(handleFinalRestaurantSelect);
  $(handleFindOutMore);
  $(highlightChosenGenre);
}

$(init);