var results = [];

var addResult = function(data, date) {
    data.comments = [];
    data.dateInfo = {date: date.toLocaleDateString('en-GB'), time: date.toLocaleTimeString('en-GB')};
    data.img = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    results.push(data);
};

var findResultByNameAndCountry = function(data) {
    return results.findIndex(function(element) {
        return (element.name === data.name && element.sys.country === data.country);
    });
};

var removeResult = function(data) {
    var i = findResultByNameAndCountry(data);
    results.splice(i, 1);
};

var addComment = function(data, comment) {
    var i = findResultByNameAndCountry(data);
    results[i].comments.push({text: comment});
};

var renderComments = function(comments, cityName, country) {
    commentsObject = {comments: comments};
    var source = $('#comments-template').html();
    var template = Handlebars.compile(source);
    var newHTML = template(commentsObject);
    var cardSelector ='.card[data-name="' + cityName + '"][data-country="' + country + '"] .card-body';
    $(cardSelector).append(newHTML);
};

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
                renderResults();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
};

// events to handle clicking buttons & links
$('.page-header form button').on('click', function() {
    var $input = $(this).closest('form').find('input');
    var city = $input.val();
    fetch(city);
    $input.val('');
});

$('.results').on('click', '.remove-card', function() {
    var data = $(this).closest('.card').data();
    removeResult(data);
    renderResults();
});

$('.results').on('click', '.add-comment', function() {
    $(this).siblings('.write-comment').toggleClass('show');
});

$('.results').on('click', '.write-comment button', function() {
    var comment = $(this).closest('.write-comment').find('input').val();
    var data = $(this).closest('.card').data();
    addComment(data, comment);
    renderResults();
});

// events to handle user pressing enter key in input forms
$('.city-input').on('keypress', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        var city = $(this).val();
        if (city !== '') {
            fetch(city);
            $(this).val('');
        }
    }
});

$('.results').on('keypress', '.comment-text', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        var comment = $(this).val();
        if (comment !== '') {
            var data = $(this).closest('.card').data();
            addComment(data, comment);
            renderResults();
            $(this).val('');
        }
    }
});