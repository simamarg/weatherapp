var results = [];

var addResult = function(data, date) {
    data.comments = [];
    data.dateInfo = {date: date.toLocaleDateString('en-GB'), time: date.toLocaleTimeString('en-GB')};
    results.push(data);
};

var findResultByName = function(name) {
    return results.findIndex(function(element) {
        return element.name === name;
    });
};

var removeResult = function(name) {
    var i = findResultByName(name);
    results.splice(i, 1);
};

var addComment = function(cityName, comment) {
    var i = findResultByName(cityName);
    results[i].comments.push({text: comment});
};

var renderComments = function(comments, cityName) {
    commentsObject = {comments: comments};
    var source = $('#comments-template').html();
    var template = Handlebars.compile(source);
    var newHTML = template(commentsObject);
    var cardSelector ='.card[data-name="' + cityName + '"] .card-body';
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
        return renderComments(element.comments, element.name);
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
$('button').on('click', function() {
    var $input = $(this).closest('form').find('input');
    var city = $input.val();
    fetch(city);
    $input.val('');
});

$('.results').on('click', '.remove-card', function() {
    var name = $(this).closest('.card').data().name;
    removeResult(name);
    renderResults();
});

$('.results').on('click', '.add-comment', function() {
    $(this).siblings('.write-comment').toggleClass('show');
});

$('.results').on('click', '.write-comment button', function() {
    var comment = $(this).closest('.write-comment').find('input').val();
    var cityName = $(this).closest('.card').data().name;
    addComment(cityName, comment);
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
            var cityName = $(this).closest('.card').data().name;
            addComment(cityName, comment);
            renderResults();
            $(this).val('');
        }
    }
});