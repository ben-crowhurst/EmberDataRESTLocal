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

        console.log('saving');

        console.log(record.materializeBelongsTo())

        record.eachRelationship(function(name, relationship) {
          if (relationship.kind === 'belongsTo') {
            console.log('belongsTo: ', name, relationship);

            //relationship.options.embedded = 'always';

            var parent = record.cacheFor(name);

            console.log(parent); //typeForRelationship;

            console.log(this.get('store.adapter.serializer')); //typeForRelationship;
            console.log(this.get('store.adapter.serializer.mappings')); //typeForRelationship;


            var data = {};
            data.notebook = parent.serialize({includeId: true});

            this.get('store.adapter.serializer').addRelationships(data.notebook, parent);

            console.log(JSON.stringify(data));

            //var serializer = Ember.copy(this.get('adapter.serializer'));



            //var data = parent.serialize({includeId: true});

            //var key = this.generateLocalStorageKey(data.id);


            //var type = record.constructor.toString();
            //type = type.substring(type.indexOf('.') + 1);
        
            //var key = {
            //    id: record.get('id'),
            //    type: type,
            //    username: sessionStorage.username
            //};

        //return JSON.stringify(key);

            localStorage.setItem(data.notebook.id, JSON.stringify(data));

            //console.log('cacheFor: ', JSON.stringify(data));
          } //else if (relationship.kind === 'hasMany') {
            //console.log('hasMany: ', name, relationship);
            //console.log('cacheFor: ', record.cacheFor(name));
          //}
        }, record);

        //console.log('record: ', record);



        //var key = this.generateLocalStorageKey(record);

        //var value = record.serialize({includeId: true});
        //value.isDirty = record.get('isDirty');
        //value = this.encrypt(JSON.stringify(value));

        //localStorage.setItem(key, value);
    },
    unloadLocalStorageRecord: function(record) {
        localStorage.removeItem(this.generateLocalStorageKey(record));
    },
    loadLocalStorageRecord: function(key) {
        //var encrypted = localStorage.getItem(JSON.stringify(key));

        var encrypted = localStorage.getItem(key);

        return JSON.parse(this.decrypt(encrypted));
    },
    loadLocalStorageRecords: function() {
        for (var index = 0; index < localStorage.length; index++) {
            var key = localStorage.key(index);
            //var key = JSON.parse(localStorage.key(index));

            console.log('key: ', key);

            //if (key.username === sessionStorage.username) {
                var record = this.loadLocalStorageRecord(key);

                console.log('record: ', record);

                //delete record.notebook.nominals[0].notebook_id;
                //delete record.notebook.nominals[1].notebook_id;

                console.log('record: ', JSON.stringify(record));

                this.get('adapter').load(this, Application.Notebook, record.notebook);

                //var model = this.find(Application[key.type], record.id);
                var model = this.find(Application.Notebook, record.notebook.id);

                //model.resolve();
                //model.updateRecordArrays();

                console.log('loaded model: ', model);

                //if (record.isDirty) {
                //    model.get('stateManager').transitionTo('created');
                //}

                this.extendModel(model);
            //}
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
            username: sessionStorage.username
        };

        return JSON.stringify(key);
    }
});