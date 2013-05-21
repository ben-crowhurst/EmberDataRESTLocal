Application.NotebookIndexController = Ember.ArrayController.extend({
    init: function() {
        this._super.apply(this, arguments);

        this.get('store').openLocalStorage('admin', 'user_oneway_key');
    },
    clear: function() {
        localStorage.clear();
    },
    delete: function(record) {
        record.deleteRecord();
        record.get('transaction').commit();
    },
    create: function() {
        var notebook = Application.Notebook.createRecord({
            id: uuid.v4(),
            title: 'Test Notebook Title',
            notes: 'some random notes on this entry'
        });

        notebook.get('transaction').commit();
    }
});