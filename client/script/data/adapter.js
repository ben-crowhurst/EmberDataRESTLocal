Application.Adapter = DS.RESTAdapter.extend({
    deleteRecord: function(store, type, record) {
    	var adapter = this;
        adapter.avoidBackendHttpDelete(store, type, record);
    },
    avoidBackendHttpDelete: function(store, type, record) {
    	var adapter = this;
        adapter.didDeleteRecord(store, type, record);
    }
});