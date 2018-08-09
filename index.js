'use strict'

// API Endpoints
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';
const FOURSQUARE_VENUE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/'
const GRACENOTE_SEARCH_URL = 'http://data.tmsapi.com/v1.1/movies/showings';


//
let restaurantData = [];
console.log(restaurantData);

function handlesRestaurantData(data){
  const groupsObj = data.response.groups[0];
  restaurantData = groupsObj.items;
  getPhotos();
  
  
}

function handlesPhotoData(data, index) {
  // restaurantData = restaurantData[index];
  restaurantData[index].img = `${data.response.venue.bestPhoto.prefix}100x100${data.response.venue.bestPhoto.suffix}`;
}

function getPhotos() {
  const requests = restaurantData.map(function(restaurant, index){
    const restaurantID = restaurantData[index].venue.id;
    return getDataFromFOURSQUAREVENUEApi(restaurantID, index, handlesPhotoData);})

    $.when(...requests).done(() => {
    displayFOURSQUARESearchData();
  }) 
}


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

// Handling Movie API
let movieData = []

function getDataFromGRACENOTEApi(zipCode, callback) {
  const query = {
    startDate: `${ISODate}`,
    api_key: 'wvgp8npjcpddxq2daqde46z3',
    zip: `${zipCode}`
  }
  $.getJSON(GRACENOTE_SEARCH_URL, query, callback);
}

function handleMovieData(data){
  
  const allData = data;
  console.log(allData);
  
  const mmovieData = allData.filter((movie) => movie.genres.includes("Action"));
  
  console.log(movieData);

  let genreQueryTarget = $('form').find("input[type='radio']:checked");
  const genreId = genreQueryTarget.val();
  const genre = idToGenre[genreId];
  console.log(genre);

  // movieData = data.slice(0,2);
  // console.log(movieData);
}

function renderMovieData(result){
  return  `
  <div role='button' class='movie-results' data-summary='${result.shortDescription}'>
    <h4>${result.title}</h4>
    <p>${result.shortDescription}</p>
  </div>
 `; 
}


function displayMovieData(data){
  const filteredData = data.filter(containsGenre);

  const results = filteredData.map((item, index)=>renderMovieData(item));

  $('.js-movie-result h4').html(results);
}

// Handling FOURSQUARE API---Photo
function getDataFromFOURSQUAREVENUEApi(restaurantID, index, callback){
  const query = {
    client_id: 'CQW1ZTGV0JMZAOZKLJZ5SKDWHR54ZQAQP3ERGAASEVGBIJ0Z',
    client_secret: '2GXXJC0MIY4VBFTIHABBWKNX4XPDKJVKQZAEJFIW5WBYGIGI',
    v: '20180323'
  }
  // return $.getJSON(FOURSQUARE_VENUE_SEARCH_URL+`${restaurantID}`, query, (data) => callback(data, index))
    ;
}





// Handling FOURSQUARE API---Name
function getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, callback){
  const query = {
    client_id: 'K4BJWWLZMXPCS3KRBNRPCCDGAGSIZ4L4V24EIRE0H4ZVBHGD',
    client_secret: 'AOIV5T1GDOAD412N4O53TMOOCDM15NWACGWTVVZHEB3DXGSS',
    near: `${zipCode}`,
    query: `restaurant, ${restaurantCatagory}`,
    v: '20180323',
    limit: 2,
  }
  $.getJSON(FOURSQUARE_SEARCH_URL, query, callback);
}

function renderRestaurantResult(result) {  
  return `
  <div role='button' class='restaurant-results'>
    <h4>${result.venue.name}</h4>
    <p>${result.venue.location.address}</p>
    <img src='${result.img}' alt=''>
  </div>
  `;
}

function displayFOURSQUARESearchData() {
  const results = restaurantData.map((item, index)=>renderRestaurantResult(item));
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
    
    //Restaurant Results
    let genreQueryTarget = $(event.currentTarget).find("input[type='radio']:checked");
    const genreId = genreQueryTarget.val();
    const genre = idToGenre[genreId];

    let zipCodeQueryTarget = $(event.currentTarget).find('.js-zip-code-query');
    const zipCode = zipCodeQueryTarget.val();
    const restaurantCatagory = genreToFoodCatagory[genre];
    getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, handlesRestaurantData);

   

    //Movie Results
    getDataFromGRACENOTEApi(zipCode, handleMovieData);

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



function init() {
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