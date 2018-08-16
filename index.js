'use strict'

// API Endpoints
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';
const FOURSQUARE_VENUE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/'
const GRACENOTE_SEARCH_URL = 'https://data.tmsapi.com/v1.1/movies/showings';
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';

let restaurantData = [];
let movieData = []

let theatres = [];

// Apps key of how to match movie genre to food catagory
const genreToFoodCatagory = {
  'Horror': 'comfort food',
  "Drama": 'american',
  'Fantasy': 'french',
  "Comedy": 'burger joint',
  "Children": 'pizza',
  "Action": 'diner'
};

// Calculating dates for the Movie API call
const today = new Date();
const fullISODate = today.toISOString();
const ISODate = fullISODate.substr(0,10);
const fullISODateAMonthAgo = createDateMonthAgo().toISOString();
const ISODateAMonthAgo = fullISODateAMonthAgo.substr(0,10);
function createDateMonthAgo() {
  const date = new Date(); 
  const todayAMonthAgo = date.setMonth(date.getMonth() -1);
  return date;    
} 

// Beginning the app
function renderBeginResults() {
  $('.js-search-form').prop('hidden', false);
  $('header').html("<h1>CineMeal</h1>");
  $('.explanation').prop('hidden', true);
  $('.edit').hide();
}

function handleBeginButton() {
  $('.js-begin').on('click', event=>{
    renderBeginResults();
    });
}

// Handling Movie Results

  //API request for movie posters
function getDataFromTMDBApi(movieTitle, index, callback) {
  const query = {
    query: `${movieTitle}`,
    api_key: '0d004f603b5e46bc91ac76e45f1a3078',
  }
  return $.getJSON(TMDB_SEARCH_URL,  query, (data) => callback(data, index));
}

  //API request for movies in theaters, titles, descriptions, genres, showtimes
function getDataFromGRACENOTEApi(zipCode, callback) {
  const query = {
    startDate: `${ISODate}`,
    api_key: 'wvgp8npjcpddxq2daqde46z3',
    zip: `${zipCode}`
  }
  $.getJSON(GRACENOTE_SEARCH_URL, query, callback)
  .fail(function(jqXHR, textStatus, errorThrown){
    //error handling if zip code is not valid zip code
    if (textStatus == 'parsererror'){
      $('.error-section').html("<p class='select-error'>The zipcode you have selected is not returning any results. It may be an invalid zipcode.Please Edit and try again</p>");
    } else if (textStatus== 'error'){
      //error handling if api quota limit has been reached
      $('.error-section').html("<p class='select-error'>Limit has been reached. Try again later for movie results</p>");
    }
  });
}

function handleMovieData(data){
  const allData = data;
  movieData = allData.filter(filtersGenre).slice(0,3);
  getMoviePhotos();
}

function getMoviePhotos() {
  const requests = movieData.map(function(movie, index){
    const movieTitle = movieData[index].title;
    return getDataFromTMDBApi(movieTitle, index, handlesMoviePhotoData);})
    $.when(...requests).done(() => {
    displayMovieData();
  }) 
}

function handlesMoviePhotoData(data, index) {
  movieData[index].img = `http://image.tmdb.org/t/p/w185/${data.results[0].poster_path}`;
}

function filtersGenre(movie) {
  let genreQueryTarget = $('form').find("input[type='radio']:checked");
  const genre = genreQueryTarget.val();
    return (movie.genres != undefined && movie.genres.includes(genre));
  }

function displayMovieData(data){
  const results = movieData.map((item, index)=>renderMovieData(item));
  $('.js-movie-result h4').html(results);
}

function renderMovieData(movieObj){
  const showtimeObj = JSON.stringify(movieObj.showtimes);
  return  `
  <div role='button' class='movie-results' data-summary='${movieObj.shortDescription}' data-showtimes='${showtimeObj}'>
    <h4>${movieObj.title}</h4>
    <img src='${movieObj.img}' alt='movie poster'>
  </div>
 `;
}

//Handles Restaurant Results
  // Handling FOURSQUARE API---Photo
function getDataFromFOURSQUAREVENUEApi(restaurantID, index, callback){
  const query = {
    client_id: 'LDU1IMFBFBXKY5H3U12DVVLQCZLBKWQXJRAMS0NZTJDFXRFT',
    client_secret: 'YINO3OLPKLHIZFUP1NQ1HJG03EUBTWI5AV0DZIIWINSYA5DD',
    v: '20180323'
  }
  return $.getJSON(FOURSQUARE_VENUE_SEARCH_URL+`${restaurantID}`, query, (data) => callback(data, index))
  .fail(function() {
    //if API quota limit is reached, will instead populate with placeholder image and hours
    handlesVenuePlaceholderData();
  })
}

// Handling FOURSQUARE API---Name
function getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, callback){
  const query = {
    client_id: 'LDU1IMFBFBXKY5H3U12DVVLQCZLBKWQXJRAMS0NZTJDFXRFT',
    client_secret: 'YINO3OLPKLHIZFUP1NQ1HJG03EUBTWI5AV0DZIIWINSYA5DD',
    near: `${zipCode}`,
    query: `restaurant, ${restaurantCatagory}`,
    v: '20180323',
    limit: 3,
  }
  $.getJSON(FOURSQUARE_SEARCH_URL, query, callback);
}

function handlesRestaurantData(data){
  const groupsObj = data.response.groups[0];
  restaurantData = groupsObj.items;
  getRestaurantPhotos();
}

function getRestaurantPhotos() {
  const requests = restaurantData.map(function(restaurant, index){
    const restaurantID = restaurantData[index].venue.id;
    return getDataFromFOURSQUAREVENUEApi(restaurantID, index, handlesVenueData);
  })
    $.when(...requests).done(() => {
    displayFOURSQUARESearchData();
  }) 
}

function handlesVenueData(data, index) {
  restaurantData[index].img = `${data.response.venue.bestPhoto.prefix}100x100${data.response.venue.bestPhoto.suffix}`;
  if (data.response.venue.hours !== undefined) {
    restaurantData[index].hours = data.response.venue.hours.timeframes.map((hourInfo) => renderHours(hourInfo));
  } else {
  restaurantData[index].hours = `Restaurant did not provide hours`;
  }
}

function renderHours(hourInfo) {
  return `${hourInfo.days}: ${hourInfo.open[0].renderedTime}`
}

function displayFOURSQUARESearchData() {
  const results = restaurantData.map((item, index)=>renderRestaurantResult(item));
  $('.js-restaurant-result h4').html(results);
}

function renderRestaurantResult(result) {
  const hoursObj = JSON.stringify(result.hours); 
  return `
  <div role='button' class='restaurant-results' data-hours='${hoursObj}' data-description='${result.description}'>
    <h4>${result.venue.name}</h4>
    <img class='restaurant-image' style='height:185px;width:185px'src='${result.img}' alt='restaurant'>
    <p>${result.venue.location.address}</p> 
  </div>
  `;
}

function handlesVenuePlaceholderData() {
  restaurantData.map(function(restaurant, index) {
    restaurantData[index].img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sinnbild_Autobahngasthaus.svg/100px-Sinnbild_Autobahngasthaus.svg.png';
    restaurantData[index].hours = `check back later for hours`;
  });
  displayFOURSQUARESearchData();
}

// Displaying initial results
function showResultsinDOM(zipCode) {
  $('.results-section').prop('hidden', false)
  $('.genre-radio-button').not('.genre-selected').hide();
  $('.chosen-section').addClass('inputs-chosen');
  $('.chosen-section .choose-genre').html('Genre:');
  $('.chosen-section .choose-location').html('Location:');
  $("label[for='js-zip-code-query']").hide();
  $('.js-zip-code-query').replaceWith(`<div class='zipcode-chosen'><span>🏙️</span><p>${zipCode}</p></div>`);
  $('.js-search-form button.submit').hide();
  $('.edit').show();
  $('.find-out-more').prop('hidden', false);
}

// Clicking form submission
function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    //Restaurant Results
    //Check for dynamically added genre button to be selected
    let genreQueryTarget = $(event.currentTarget).find("input[type='radio']:checked");
    const genre = genreQueryTarget.val();
    let zipCodeQueryTarget = $(event.currentTarget).find('.js-zip-code-query');
    const zipCode = zipCodeQueryTarget.val();
    const restaurantCatagory = genreToFoodCatagory[genre];
    getDataFromFOURSQUAREApi(zipCode, restaurantCatagory, handlesRestaurantData);
    //Movie Results
    getDataFromGRACENOTEApi(zipCode, handleMovieData);
    showResultsinDOM(zipCode);
    
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

// handling edititing choices
function handleEditChoices(){
  $('.edit').on('click', function(event){
    event.preventDefault();
    $('form')[0].reset();
    $('.genre-radio-button').not('.genre-selected').show();
    $('.genre-radio-button').removeClass('genre-selected');
    $('.js-search-form button.submit').show();
    $('.chosen-zip-wrapper').html(`
        <h2 class='choose-location'>Location</h2>
          <label for="js-zip-code-query">Zip Code:</label>
          <input class="js-zip-code-query" id="js-zip-code-query" type="text" required><br>`)
    $('.edit').hide();
    $('.error-section').hide();
  });
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
    //Handling clicking on find out more button
function handleFindOutMore(){
  $('.find-out-more').on('click', function() {
    const movieChosen = $('.movie-results.result-selected h4').html();
    const restaurantChosen = $('.restaurant-results.result-selected h4').html();
    //Checking to make sure on movie and on restaurant is chosen and giving error if not
    if ( (movieChosen !== undefined) && (restaurantChosen !== undefined) ) {
      //return more info on selected movie and restaurant
      $('.modal').css('display', 'block');
      handleCloseModal();
      displayMovieMoreInfo();
      displayRestaurantMoreInfo();
      displayShowtimes();
      displayRestaurantHours();
      $('.js-select-error p').hide();
      const venueIDquery = $('result-selected').data('venueID');
      // give error paragraph if both aren't chosen
    } else {
      $('.js-select-error').html("<p class='select-error'>Please select one movie and one restaurant</p>");
  }});
}

  //Restaurant
function displayRestaurantMoreInfo() {
  $('.restaurant-more-info').html(renderRestaurantMoreInfo());
}

function renderRestaurantMoreInfo() {
  // const restaurantHours = $('.restaurant-results.result-selected').data('hours');
  const restaurantName = $('.restaurant-results.result-selected h4').html();
  let genreQueryTarget = $('form').find("input[type='radio']:checked");
  let genre = genreQueryTarget.val();
  const restaurantCatagory = genreToFoodCatagory[genre];
  // Adjusting genre search term to genre
  if(genre == 'Children'){
    genre = 'Family';
  }
  if(genre == 'Fantasy'){
    genre = 'Romance';
  }
  return `
  <div>
    <h4>${restaurantName}</h4>
    <p>Known as one of your areas top ${restaurantCatagory} restaurants, we think this pairs best with a ${genre} movie</p>
  </div>
  `;
}

function displayRestaurantHours(){
  const hoursArr = $('.restaurant-results.result-selected').data('hours');
  const results = hoursArr.map((segment) => renderRestaurantHours(segment))
  $('.restaurant-hours').html(results);
}

function renderRestaurantHours(segment){
  return `
    <p>${segment}</p>
  `
}

  //Movie
function displayMovieMoreInfo() {
  $('.movie-more-info').html(renderMovieMoreInfo());
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

function displayShowtimes(){
  const showtimesArr = $('.movie-results.result-selected').data('showtimes');
  const showtimes = showtimesArr.map((item) => renderShowtimes(item));
  $('.showtimes').html(showtimes);
  theatres = [];
}

function renderShowtimes(result){
// Transform data into AMPM showtimes
  const militaryTime = result.dateTime.slice(11);
  const standardTime = militaryTime.split(':');
  const hours = Number(standardTime[0]);
  const minutes = Number(standardTime[1]);
  let displayTime= '';
  if (hours > 0 && hours <= 12) {
    displayTime= "" + hours;
    } else if (hours > 12) {
    displayTime= "" + (hours - 12);
    } else if (hours == 0) {
    displayTime= "12";
  }
  displayTime += (minutes < 10) ? ":0" + minutes : ":" + minutes;  
  displayTime += (hours >= 12) ? " PM" : " AM";
  //Results will return at most three theatres
  while ( (theatres.length < 3)  || (theatres.includes(`${result.theatre.name}`))){
    if (!(theatres.includes(`${result.theatre.name}`))    ) {
      theatres.push(`${result.theatre.name}`);
      return `
      <p class='theatreName'>${result.theatre.name}</p>
      <p class='showtimeTime'>${displayTime}</p>
      `;
      } else {
      return `
      <p class='showtimeTime'>${displayTime}</p>`;
      } 
    };
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