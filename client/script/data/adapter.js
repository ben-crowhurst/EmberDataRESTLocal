Application.Adapter = DS.RESTAdapter.extend({
    deleteRecord: function(store, type, record) {
        this.avoidBackendHttpDelete(store, type, record);
    },
    avoidBackendHttpDelete: function(store, type, record) {
        this.didDeleteRecord(store, type, record);
    }
});

// Application.Adapter.map('Application.Notebook', {
//     nominals: {
//         embedded: 'loaded'
//     }
// });