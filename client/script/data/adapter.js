Application.Adapter = DS.RESTAdapter.extend({
    init: function() {
        this._super.apply(this, arguments);

        this.reopenModelImplementation();
    },
    reopenModelImplementation: function() {
        DS.Model.reopen({
            cache: $.debounce(1000, function() {
                if (this.get('isDirty')) {
                    var record = JSON.stringify(this.toJSON({includeId: true}));

                    var encrypted = CryptoJS.AES.encrypt(record, sessionStorage.passphrase);

                    var type_info = this.constructor.toString();
                    type_info = type_info.split('.');

                    localStorage.setItem(JSON.stringify({
                        id: this.get('id'),
                        type: type_info[1],
                        passphrase: sessionStorage.passphrase                        
                    }), encrypted.toString());

                    console.log('caching: ', record);
                }
            }).observes('isDirty')
        });
    },
    deleteRecord: function(store, type, record) {
        console.log('deleting: ', record);
        this.avoidBackendHttpDelete(record);
    },
    avoidBackendHttpDelete: function(record) {
        record.unloadRecord();
    },
    openLocalStorage: function(username, password, store) {
        sessionStorage.passphrase = CryptoJS.PBKDF2(password, username, {
            keySize: 256/32
        }).toString();

        this.loadLocalStorage(store);
    },
    loadLocalStorage: function(store) {
        for (var index = 0; index < localStorage.length; index++) {
            var key = JSON.parse(localStorage.key(index));

            if (key.passphrase === sessionStorage.passphrase) {
                var encrypted = localStorage.getItem(JSON.stringify(key));

                var decrypted = CryptoJS.AES.decrypt(encrypted, sessionStorage.passphrase);

                this.load(store, Application[key.type], JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));

                console.log('loaded: ', decrypted.toString(CryptoJS.enc.Utf8));
            }
        }
    },
    didError: function (store, type, record, xhr) {
        record.xhr = xhr;

        if (xhr.status === 422) {
            var data = JSON.parse(xhr.responseText);

            store.recordWasInvalid(record, data.errors);
        } else {
            this._super.apply(this, arguments);
        }
    }
});