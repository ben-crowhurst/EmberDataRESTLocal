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
            id: uuid.v4(),
            title: 'Test Notebook Title',
            notes: 'some random notes on this entry'
        });

        notebook.get('nominals').pushObject(Application.Nominal.createRecord({
            id: uuid.v4(),
            forename: 'Ben',
            surname: 'Crowhurst'
        }));

        var nominal = Application.Nominal.createRecord({
            id: uuid.v4(),
            forename: 'Tom',
            surname: 'Crowhurst'
        });

        nominal.set('vehicle', Application.Vehicle.createRecord({
            id: uuid.v4(),
            vrm: 'SB53YUK'
        }));

        notebook.get('nominals').pushObject(nominal);      
    },
    upload: function() {
        this.get('store').commit();
    }
});