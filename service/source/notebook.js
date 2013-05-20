var $ = require('jquery');

exports.create = function(request, response) {
    var record = request.body;
    
    console.log('created: ', record);

    response.send({}, 201);
};

exports.read = function(request, response) {
    response.send({}, 200);
}