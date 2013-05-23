Application.Store = DS.Store.extend({
    revision: 12,
    adapter: Application.Adapter.create(),
    openLocalStorage: function(username, password) {
        sessionStorage.username = username;

        sessionStorage.passphrase = this.generatePassphrase(username, password);

        this.loadLocalStorageRecords();

        this.overrideCreateRecord();
    },
    saveLocalStorageRecord: function(record) {
        var data = record.serialize({includeId: true});

        record.eachRelationship(function(name, relationship) {
          if (relationship.kind === 'hasMany') {
             this.get('store.adapter.serializer').addHasMany(data, this, 'notebook', relationship);

            var nominals = this.get(relationship.key).toArray();

            data.hasMany = {};
            data.hasMany[relationship.key] = [];

            for(var index = 0; index != nominals.length; index++) {
                data.hasMany[relationship.key].push(nominals[index].id);
            }
          }
        }, record);


        localStorage.setItem(this.generateLocalStorageKey(record), JSON.stringify(data));
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

            var value = this.loadLocalStorageRecord(key);

            this.get('adapter').load(this, Application[key.type], value, {});
        }

        for (var index = 0; index < localStorage.length; index++) {
            var key = JSON.parse(localStorage.key(index));

            var record = this.loadLocalStorageRecord(key);

            var model = this.find(Application[key.type], record.id);

            for(var property in record.hasMany) {
                var childern = record.hasMany[property];

                for (var i = 0; i != childern.length; i++) {
                    var ck = {
                        id: childern[i],
                        type: 'Nominal'
                    };

                    var child = this.loadLocalStorageRecord(ck);

                    var ch = this.find(Application[ck.type], child.id);

                    model.get(property).pushObject(ch);
                }
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

        //dataDidChange
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
            //username: sessionStorage.username
        };

        return JSON.stringify(key);
    }
});

