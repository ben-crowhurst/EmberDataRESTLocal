Application.Store = DS.Store.extend({
    revision: 12,
    adapter: 'Application.Adapter',
    openLocalStorage: function(username, password) {
        sessionStorage.username = username;

        sessionStorage.passphrase = this.generatePassphrase(username, password);

        this.loadLocalStorageRecords();

        this.overrideCreateRecord();
    },
    saveLocalStorageRecord: function(record) {
        // record.eachRelationship(function(name, relationship) {
        //   if (relationship.kind === 'belongsTo') {
        //     console.log('belongsTo');
        //   } else if (relationship.kind === 'hasMany') {
        //     console.log('hasMany');
        //   }
        // }, this);

        console.log(this);
        console.log(this.adapter.get('serializer').materialize(record, record.serialize({includeId: true}), {}));

        var key = this.generateLocalStorageKey(record);

        var value = record.serialize({includeId: true});
        value.isDirty = record.get('isDirty');
        value = this.encrypt(JSON.stringify(value));

        localStorage.setItem(key, value);
    },
    unloadLocalStorageRecord: function(record) {
        localStorage.removeItem(this.generateLocalStorageKey(record));
    },
    loadLocalStorageRecord: function(key) {
        var encrypted = localStorage.getItem(JSON.stringify(key));

        return JSON.parse(this.decrypt(encrypted));
    },
    loadLocalStorageRecords: function() {
        for (var index = 0; index < localStorage.length; index++) {
            var key = JSON.parse(localStorage.key(index));

            if (key.username === sessionStorage.username) {
                var record = this.loadLocalStorageRecord(key);

                this.load(Application[key.type], record);

                var model = this.find(Application[key.type], record.id);

                if (record.isDirty) {
                    model.get('stateManager').transitionTo('created');
                }

                this.extendModel(model);
            }
        }
    },
    overrideCreateRecord: function() {
        this.reopen({
            createRecord: function(type, properties, transaction) {
                var model = this._super.apply(this, arguments);

                Ember.run.once(this, function() {
                    this.extendModel(model);

                    this.saveLocalStorageRecord(model);
                });

                return model;
            }
        });    
    },
    extendModel: function(record) {
        record.reopen({
            updateLocalStorageRecord: $.debounce(1000, function() {
                if (this.get('isDirty') || this.get('isValid') && !this.get('isDeleted')) {
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
    encrypt: function(value) {
        return value; //CryptoJS.AES.encrypt(value, sessionStorage.passphrase);
    },
    decrypt: function(value) {
        return value; //CryptoJS.AES.decrypt(value, sessionStorage.passphrase).toString(CryptoJS.enc.Utf8);
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