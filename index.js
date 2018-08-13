'use strict'

// API Endpoints
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/explore';
const FOURSQUARE_VENUE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/'
const GRACENOTE_SEARCH_URL = 'https://data.tmsapi.com/v1.1/movies/showings';
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';


//
let restaurantData = [];

function handlesRestaurantData(data){
  const groupsObj = data.response.groups[0];
  restaurantData = groupsObj.items;
  getRestaurantPhotos();
}

function handlesPhotoData(data, index) {
  console.log(data);
  restaurantData[index].img = `${data.response.venue.bestPhoto.prefix}100x100${data.response.venue.bestPhoto.suffix}`;
  if(data.response.venue.description == undefined) {
    restaurantData[index].description = 'Description not provided';
  } else {
    restaurantData[index].description = `${data.response.venue.description}`;
  };

  // console.log(data.response.venue.hours.timeframes.map((item) => `${response.venue.days} + ${open[0].renderedTime}`));
  // restaurantData[index].hours = `${data.response.venue.description}`

    
}

function getRestaurantPhotos() {
  const requests = restaurantData.map(function(restaurant, index){
    const restaurantID = restaurantData[index].venue.id;
    return getDataFromFOURSQUAREVENUEApi(restaurantID, index, handlesPhotoData);
  })
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
// const idToGenre = {
//   27: 'Horror',
//   18: 'Drama',
//   10749: 'Fantasy',
//   35: 'Comedy',
//   10751: 'Children',
//   28: 'Action'
// }

// Apps key of how to match movie genre to food catagory
const genreToFoodCatagory = {
  'Horror': 'comfort food',
  "Drama": 'american',
  'Fantasy': 'french',
  "Comedy": 'burger joint',
  "Children": 'pizza',
  "Action": 'diner'
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
    api_key: 'nvvvccjun8w86gcpzw7apfhk',
    zip: `${zipCode}`
  }
  $.getJSON(GRACENOTE_SEARCH_URL, query, callback);
}

function handleMovieData(data){
  let genreQueryTarget = $('form').find("input[type='radio']:checked");
  const genre = genreQueryTarget.val();
  const allData = data;
    function filtersGenre(movie) {
      return (movie.genres != undefined && movie.genres.includes(genre));
    }

  movieData = allData.filter(filtersGenre).slice(0,3);
  getMoviePhotos();
}

function handlesMoviePhotoData(data, index) {
  movieData[index].img = `http://image.tmdb.org/t/p/w185/${data.results[0].poster_path}`;
}

function getMoviePhotos() {
  const requests = movieData.map(function(movie, index){
    const movieTitle = movieData[index].title;
    return getDataFromTMDBApi(movieTitle, index, handlesMoviePhotoData);})
    $.when(...requests).done(() => {
    displayMovieData();
  }) 
}

function renderMovieData(movieObj){
  const showtimeObj = JSON.stringify(movieObj.showtimes);
  return  `
  <div role='button' class='movie-results' data-summary='${movieObj.shortDescription}' data-showtimes='${showtimeObj}'>
    <h4>${movieObj.title}</h4>
    <img src='${movieObj.img}' alt=''>
  </div>
 `; 

 // <p>${movieObj.shortDescription}</p>

}

function displayMovieData(data){
  const results = movieData.map((item, index)=>renderMovieData(item));
  $('.js-movie-result h4').html(results);
}

// TMDB Pic

function getDataFromTMDBApi(movieTitle, index, callback) {
  const query = {
    query: `${movieTitle}`,
    api_key: '0d004f603b5e46bc91ac76e45f1a3078',
    // 'primary_release_date.gte':`${ISODateAMonthAgo}`,
    // 'primary_release_date.lte':`${ISODate}`,
    // sort_by: 'popularity.desc',
  }
  return $.getJSON(TMDB_SEARCH_URL,  query, (data) => callback(data, index));
}

function displayTMDBSearchData(data) {
  const topThree = data.results.slice(0,3);
  const results = topThree.map((item, index)=>renderMovieResult(item));
  $('.js-movie-result h3').append(results);
}

// Handling FOURSQUARE API---Photo
function getDataFromFOURSQUAREVENUEApi(restaurantID, index, callback){
  const query = {
    client_id: 'LDU1IMFBFBXKY5H3U12DVVLQCZLBKWQXJRAMS0NZTJDFXRFT',
    client_secret: 'FRM2LE0IBDDJTDTMASJOWAJBWV1UOKO432UDF5ZPVYRVBUWZ',
    v: '20180323'
  }
  return $.getJSON(FOURSQUARE_VENUE_SEARCH_URL+`${restaurantID}`, query, (data) => callback(data, index));
}



// Handling FOURSQUARE API---Name
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

function renderRestaurantResult(result) {  
  return `
  <div role='button' class='restaurant-results' data-description='${result.description}'>
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
  // const restaurantAddress = $('.restaurant-results.result-selected').data('address');
  
  const restaurantDescription = $('.restaurant-results.result-selected').data('description');

  const restaurantName = $('.restaurant-results.result-selected h4').html();
  console.log(restaurantName);
  let genreQueryTarget = $('form').find("input[type='radio']:checked");
  const genre = genreQueryTarget.val();
  const restaurantCatagory = genreToFoodCatagory[genre];
  return `
  <div>
    <h4>${restaurantName}</h4>
    <p>${restaurantDescription}</p>
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
      displayShowtimes();
      $('.js-select-error p').hide();
      const venueIDquery = $('result-selected').data('venueID');
      // give error paragraph if both aren't chosen
    } else {
      $('.js-select-error').html("<p class='select-error'>Please select one movie and one restaurant</p>");
  }});
}

const theatres = [];
let theatreCounter = 0;
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

function displayShowtimes(){
  const showtimesArr = $('.movie-results.result-selected').data('showtimes');
  const showtimes = showtimesArr.map((item) => renderShowtimes(item));
  $('.showtimes').html(showtimes);
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