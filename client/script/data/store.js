Application.Store = DS.Store.extend({
    revision: 12,
    adapter: Application.Adapter.create(),
    openLocalStorage: function(username, password) {
        this.get('adapter').openLocalStorage(username, password, this);
    }
});