Application.NotebookIndexRoute = Ember.Route.extend({
    model: function() {
        return Application.Notebook.find();
    }
});