Application.Adapter = DS.RESTAdapter.extend({
    deleteRecord: function(store, type, record) {
    	var adapter = this;
        adapter.avoidBackendHttpDelete(store, type, record);
     
        //var cache = store.get('cache');
        //cache.set(record.id, null);
    },
    avoidBackendHttpDelete: function(store, type, record) {
    	var adapter = this;
        adapter.didDeleteRecord(store, type, record);
    }
});

// Application.Adapter.map(Application.Notebook, {
//   nominals: { embedded: 'load' }
// });

// Application.Adapter.map(Application.Nominal, {
//   vehicle: { embedded: 'load' }
// });