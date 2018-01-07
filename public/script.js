var results = [];

var addResult = function(data) {
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

var renderResults = function() {
    $('.results').empty();
    resultsObject = {results: results};
    var source = $('#result-template').html();
    var template = Handlebars.compile(source);
    var newHTML = template(resultsObject);
    $('.results').append(newHTML);
};

var fetch = function(city) {
    $.ajax({
        method: "GET",
        url: 'http://api.openweathermap.org/data/2.5/find?q=' + city +'&units=metric&APPID=d703871f861842b79c60988ccf3b17ec',
        success: function (data) {
            console.log(data);
            addResult(data.list[0]);
            renderResults();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
};

// events
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