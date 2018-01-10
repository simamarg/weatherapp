var STORAGE_ID = 'results';

var saveToLocalStorage = function () {
  localStorage.setItem(STORAGE_ID, JSON.stringify(results));
}

var getFromLocalStorage = function () {
  return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
}

var results = getFromLocalStorage();

// store the search result to the results array
var addResult = function(data, date) {
    data.comments = [];
    data.dateInfo = {date: date.toLocaleDateString('en-GB'), time: date.toLocaleTimeString('en-GB')};
    data.img = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    results.push(data);
};

// find the index of the result in the result array based on its' city and country
var findResultByNameAndCountry = function(data) {
    return results.findIndex(function(element) {
        return (element.name === data.name && element.sys.country === data.country);
    });
};

// remove result from the results array
var removeResult = function(data) {
    var i = findResultByNameAndCountry(data);
    results.splice(i, 1);
};

// store comment in the comments array of the specific city result
var addComment = function(data, comment) {
    var i = findResultByNameAndCountry(data);
    results[i].comments.push({text: comment});
};

// show comments on screen
var renderComments = function(comments, cityName, country) {
    commentsObject = {comments: comments};
    var source = $('#comments-template').html();
    var template = Handlebars.compile(source);
    var newHTML = template(commentsObject);
    var cardSelector ='.card[data-name="' + cityName + '"][data-country="' + country + '"] .card-body';
    $(cardSelector).append(newHTML);
};

// show results (cities' weather cards) on screen
var renderResults = function() {
    $('.results').empty();
    resultsObject = {results: results};
    var source = $('#result-template').html();
    var template = Handlebars.compile(source);
    var newHTML = template(resultsObject);
    $('.results').append(newHTML);
    results.forEach(function(element) {
        return renderComments(element.comments, element.name, element.sys.country);
    });
};

// request the weather for a given city from OpenWeatherMap API
var fetch = function(city) {
    $.ajax({
        method: "GET",
        url: 'http://api.openweathermap.org/data/2.5/find?q=' + city + 
                '&units=metric&APPID=d703871f861842b79c60988ccf3b17ec',
        success: function (data) {
            console.log(data);
            var date = new Date();
            if (data.list.length) {
                addResult(data.list[0], date);
                saveToLocalStorage();
                renderResults();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
};

// events to handle clicking buttons & links:
// pressing "Get Temp" to get the temp in a specific city
$('.page-header form button').on('click', function() {
    var $input = $(this).closest('form').find('input');
    var city = $input.val();
    fetch(city);
    $input.val('');
});

// pressing remove to delete a result card (that shows the temp in a city)
$('.results').on('click', '.remove-card', function() {
    var data = $(this).closest('.card').data();
    removeResult(data);
    saveToLocalStorage();
    renderResults();
});

// pressing comment link in the result card to toggle add comment form visibility (show/hide add comment form)
$('.results').on('click', '.add-comment', function() {
    $(this).siblings('.write-comment').toggleClass('show');
});

// pressing write comment for a result card
$('.results').on('click', '.write-comment button', function() {
    var comment = $(this).closest('.write-comment').find('input').val();
    var data = $(this).closest('.card').data(); // data = city & country
    addComment(data, comment);
    saveToLocalStorage();
    renderResults();
});

// show the items from localStorage when page loads
$(document).ready(renderResults);

// events to handle user pressing enter key in input forms:
// pressing enter in city search form
$('.city-input').on('keypress', function(event) {
    if (event.keyCode === 13) { // 13 = enter key
        event.preventDefault(); // default behavior is submitting the form
        var city = $(this).val();
        if (city !== '') {
            fetch(city);
            $(this).val('');
        }
    }
});

// pressing enter in add comment form
$('.results').on('keypress', '.comment-text', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        var comment = $(this).val();
        if (comment !== '') {
            var data = $(this).closest('.card').data(); // data = city & country
            addComment(data, comment);
            renderResults();
            $(this).val('');
        }
    }
});