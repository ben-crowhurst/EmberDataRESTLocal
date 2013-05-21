Application.Store = DS.Store.extend({
    revision: 12,
    adapter: 'Application.Adapter',
    createRecord: function() {
        var record = this._super.apply(this, arguments);

        this.saveLocalStorageRecord(record);

        this.extendRecord(record);

        return record;
    },
    openLocalStorage: function(username, password) {
        sessionStorage.username = username;

        sessionStorage.passphrase = this.generatePassphrase(username, password);

        this.loadLocalStorageRecords();
    },
    saveLocalStorageRecord: function(record) {
        var key = this.generateLocalStorageKey(record);

        var value = this.encryptRecord(record);

        localStorage.setItem(key, value);
    },
    unloadLocalStorageRecord: function(record) {
        localStorage.removeItem(this.generateLocalStorageKey(record));
    },
    loadLocalStorageRecord: function(key) {
        var encrypted = localStorage.getItem(JSON.stringify(key));

        return this.decryptRecord(encrypted);
    },
    loadLocalStorageRecords: function() {
        for (var index = 0; index < localStorage.length; index++) {
            var key = JSON.parse(localStorage.key(index));

            if (key.username === sessionStorage.username) {
                var record = this.loadLocalStorageRecord(key);

                this.load(Application[key.type], record);

                record = this.find(Application[key.type], record.id);

                this.extendRecord(record);
            }
        }
    },
    extendRecord: function(record) {
        record.reopen({
            updateLocalStorageRecord: $.debounce(1000, function() {
                if (this.get('isDirty') && !this.get('isDeleted')) {
                    this.get('store').saveLocalStorageRecord(this);
                }
            }).observes('isDirty'),
            deleteLocalStorageRecord: $.debounce(1000, function() {
                if (this.get('isDeleted')) {
                    this.get('store').unloadLocalStorageRecord(this);
                }                
            }).observes('isDeleted')
        });
    },
    encryptRecord: function(record) {
        var value = JSON.stringify(record.toJSON({includeId: true}));

        return CryptoJS.AES.encrypt(value, sessionStorage.passphrase);
    },
    decryptRecord: function(encrypted) {
        var decrypted = CryptoJS.AES.decrypt(encrypted, sessionStorage.passphrase);

        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    },
    generatePassphrase: function(username, password) {
        return CryptoJS.PBKDF2(username, password, {
            keySize: 256/32
        }).toString();
    },
    generateLocalStorageKey: function(record) {
        var type = record.constructor.toString();
        type = type.substring(type.indexOf('.') + 1);
        
        var key = {
            id: record.get('id'),
            type: type,
            username: sessionStorage.username
        };

        return JSON.stringify(key);
    }
});