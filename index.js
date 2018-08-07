'use strict'

// API Endpoints
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/discover/movie?';
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';
const FOURSQUARE_VENUE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/'
const GRACENOTE_SEARCH_URL = 'http://data.tmsapi.com/v1.1/movies/showings';

// Calculating dates for the Movie API call
const today = new Date();
const fullISODate = today.toISOString();
const ISODate = fullISODate.substr(0,10);
function createDateMonthAgo() {
  const date = new Date(); 
  const todayAMonthAgo = date.setMonth(date.getMonth() -1);
  return date;    
  } 
const fullISODateAMonthAgo = createDateMonthAgo().toISOString();
const ISODateAMonthAgo = fullISODateAMonthAgo.substr(0,10);

//TMDB's genre IDs
const idToGenre = {
  27: 'horror',
  18: 'drama',
  10749: 'romantic',
  35: 'comedy',
  10751: 'family',
  28: 'action'
}

// Apps key of how to match movie genre to food catagory
const genreToFoodCatagory = {
  horror: 'comfort food',
  drama: 'american',
  romantic: 'french',
  comedy: 'burger joint',
  family: 'pizza',
  action: 'diner'
};

// Beginning the app
function renderBeginResults() {
  $('.js-search-form').prop('hidden', false);
  $('header').html("<h1>Dinner and a Movie Chooser</h1>");
  $('.initial-page').prop('hidden', true);
  $('.edit').hide();
}
function handleBeginButton() {
  $('.js-begin').on('click', event=>{
    renderBeginResults();
    });
}

// Handling TMDB API
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

function renderMovieResult(result) {
  return `
  <div role='button' class='movie-results' data-summary='${result.overview}'>
    <h4>${result.title}</h4>
    <img src='http://image.tmdb.org/t/p/w154${result.poster_path}' alt=''>
  </div>
  `;
}

function displayTMDBSearchData(data) {
  const topThree = data.results.slice(0,10);
  const results = topThree.map((item, index)=>renderMovieResult(item));
  $('.js-movie-result h4').html(results);
  console.log(data);
}

// Handling FOURSQUARE API---Photo
function getDataFromFOURSQUAREVENUEApi(restaurantID, callback){
  const query = {
    client_id: 'K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD',
    client_secret: 'AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS',
    v: '20180323'
  }
  $.getJSON(FOURSQUARE_VENUE_SEARCH_URL+`${restaurantID}`, query, callback);
}

function displayFOURSQUAREPhoto(data) {
  const results = data.map((item, index)=>renderPhotoResult(item));
  $('.js-restaurant-result div').html(results);
  console.log(data);
}



// Handling FOURSQUARE API---Name
function getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, callback){
  const query = {
    client_id: 'K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD',
    client_secret: 'AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS',
    near: `${zipCode}`,
    query: `restaurant, ${restaurantCatagory}`,
    v: '20180323',
    limit: 10,
  }
  $.getJSON(FOURSQUARE_SEARCH_URL, query, callback);
}


//   function renderRestaurantResult(result) {
//     const restaurantID = `${result.venue.id}`;
//     console.log(restaurantID);


//     function renderPhotoResult(data) {
//       const restaurantPhoto = `${data.response.venue.bestPhoto.prefix}100x100${data.response.venue.bestPhoto.suffix}`;
//       return restaurantPhoto;
//     }
//     getDataFromFOURSQUAREVENUEApi(restaurantID, renderPhotoResult);
  
//     return `
//     <div role='button' class='restaurant-results' data-address='${result.venue.location.formattedAddress[0]}' data-venueID='${result.venue.id}'>
//       <h4>${result.venue.name}</h4>
//       <p></p>
//     </div>
//     `;
//   }



function renderRestaurantResult(result) {  
  return `
  <div role='button' class='restaurant-results' data-address='${result.venue.location.formattedAddress[0]}' data-venueID='${result.venue.id}'>
    <h4>${result.venue.name}</h4>
    <p>${result.venue.location.formattedAddress[0]}</p>
  </div>
  `;
}

function displayFOURSQUARESearchData(data) {
  const groupsObj = data.response.groups[0];
  const results = groupsObj.items.map((item, index)=>renderRestaurantResult(item));
  $('.js-restaurant-result h4').html(results);
}







// Displaying initial results
function showResultsinDOM(zipCode) {
  $('.results-section').prop('hidden', false)
  $('.genre-radio-button').not('.genre-selected').hide();
  $('.chosen-section').addClass('inputs-chosen');
  $('.chosen-section .choose-genre').html('Genre:');
  $('.chosen-section .choose-location').html('Location:');
  $("label[for='js-zip-code-query']").hide();
  $('.js-zip-code-query').replaceWith(zipCode);
  $('.js-search-form button.submit').hide();
  $('.edit').show();
  $('.find-out-more').prop('hidden', false);
}


// Clicking form submission
function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    //Movie Results
    let genreQueryTarget = $(event.currentTarget).find("input[type='radio']:checked");
    const genreId = genreQueryTarget.val();
    const genre = idToGenre[genreId];
    getDataFromTMDBApi(genreId, displayTMDBSearchData);
    //Restaurant Results
    let zipCodeQueryTarget = $(event.currentTarget).find('.js-zip-code-query');
    const zipCode = zipCodeQueryTarget.val();
    const restaurantCatagory = genreToFoodCatagory[genre];
    getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, displayFOURSQUARESearchData);

    showResultsinDOM(zipCode);
  });
}

// handling edititing choices
function handleEditChoices(){
  $('.edit').on('click', function(event){
    event.preventDefault();
    $('.genre-radio-button').not('.genre-selected').show();
    $('.js-search-form button.submit').show();
    $('.chosen-zip-wrapper').html(`
        <h2 class='choose-location'>Location</h2>
          <label for="js-zip-code-query">Zip Code:</label>
          <input class="js-zip-code-query" type="text" value='97214' required><br>`
          )
    $('.edit').hide();
  });
}

//Highlighting the chosen genre
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

//Toggling selected Movie
function handleFinalMovieSelect(){
  $('.js-movie-result').on('click', '.movie-results', function(event){
    event.preventDefault();
    const targetMovie = $(event.currentTarget);
    const otherMovies = $('.movie-results').not(targetMovie);
    otherMovies.removeClass('result-selected');
    targetMovie.toggleClass('result-selected');
  });
}

//Toggling selected restaurant
function handleFinalRestaurantSelect(){
  $('.js-restaurant-result').on('click', '.restaurant-results', function(event){
    event.preventDefault();
    const targetRestaurant = $(event.currentTarget);
    const otherRestaurants = $('.restaurant-results').not(targetRestaurant);
    otherRestaurants.removeClass('result-selected');
    targetRestaurant.toggleClass('result-selected');
  });
}


//Giving more info of chosen movie and restaurant
  //Restaurant
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

function displayRestaurantMoreInfo() {
  $('.restaurant-more-info').html(renderRestaurantMoreInfo());
}

  //Movie
function  renderMovieMoreInfo() {
  const movieSummary = $('.movie-results.result-selected').data('summary');
  const movieTitle = $('.movie-results.result-selected h4').html();
  // getDataFromGRACENOTEApi(displayShowtimes);
  return `
  <div>
    <h4>${movieTitle}</h4>
    <p>${movieSummary}</p>
  </div>
  `;
}

function displayMovieMoreInfo() {
  $('.movie-more-info').html(renderMovieMoreInfo());
}

function handleFindOutMore(){
  $('.find-out-more').on('click', function() {
    const movieChosen = $('.movie-results.result-selected h4').html();
    const restaurantChosen = $('.restaurant-results.result-selected h4').html();
    //If both things are selected
    if ( (movieChosen !== undefined) && (restaurantChosen !== undefined) ) {
      //return more info on selected movie and restaurant
      $('.modal').css('display', 'block');
      handleCloseModal();
      displayMovieMoreInfo();
      displayRestaurantMoreInfo();
      $('.js-select-error p').hide();
      const venueIDquery = $('result-selected').data('venueID');
      // give error paragraph if both aren't chosen
    } else {
      $('.js-select-error').html("<p class='select-error'>Please select one movie and one restaurant</p>");
  }});
}

//Closing the Modal
function handleCloseModal(){
  $('span').on('click', function(){
    $('.modal').css('display', 'none');
  });
}

//Handling displaying the movie showtimes
function getDataFromGRACENOTEApi(callback) {
  const query = {
    startDate: `${ISODate}`,
    api_key: 'wvgp8npjcpddxq2daqde46z3',
    zip: '97214'
  }
  $.getJSON(GRACENOTE_SEARCH_URL, query, callback);
}

// function displayShowtimes(data){
//   console.log(data[0]);
//   return `${data[0]}`;
// }
function renderShowtimes(result){
return `<div>${result.firstTheater.dateTime}</div>`
}
function displayShowtimes(data){
  const firstMovie = data[0];
  const showtimes = firstMovie.showtimes;
  const firstTheater = showtimes[0];
  const results = firstTheater.map((item, index)=>renderShowtimes(item));
  $('.showtimes').replaceWith(results);
}

function handleShowShowtimes() {
  $('.showtimes').on('click', function(event){
    event.preventDefault();
    console.log('heard show showtimes');
    getDataFromGRACENOTEApi(displayShowtimes);
  });
}

function init() {
  $(handleShowShowtimes);
  $(handleEditChoices);
  $(handleCloseModal);
  $(handleBeginButton);
  $(watchSubmit);
  $(handleFinalMovieSelect);
  $(handleFinalRestaurantSelect);
  $(handleFindOutMore);
  $(highlightChosenGenre);
}

$(init);