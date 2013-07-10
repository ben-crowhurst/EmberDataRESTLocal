Application.NotebookIndexController = Ember.ArrayController.extend({
    init: function() {
        this._super.apply(this, arguments);

        this.get('store').openCache('admin', 'password');
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
            title: 'Test Notebook Title',
            notes: 'some random notes on this entry'
        });

        notebook.get('nominals').pushObject(Application.Nominal.createRecord({
            forename: 'Ben',
            surname: 'Crowhurst'
        }));

        var nominal = Application.Nominal.createRecord({
            forename: 'Tom',
            surname: 'Crowhurst'
        });

        nominal.set('vehicle', Application.Vehicle.createRecord({
            vrm: 'SB53YUK'
        }));

        notebook.get('nominals').pushObject(nominal);      
    },
    upload: function() {
        this.get('store').commit();
    }
});