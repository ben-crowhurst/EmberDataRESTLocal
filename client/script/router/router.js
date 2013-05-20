Application.Router.map(function() {
    this.route('index', { path: '/' });

    this.resource('notebook', function() {
        this.route('index', { path: '/' });
    });
});