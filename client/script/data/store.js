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

        //console.log(record.materializeBelongsTo())

        var data = record.serialize({includeId: true});

        record.eachRelationship(function(name, relationship) {
          if (relationship.kind === 'hasMany') { //belongsTo') {
            console.log('hasMany: ', name, relationship);

            //relationship.options.embedded = 'always';

            //var parent = record.cacheFor(name);

            //console.log(parent); //typeForRelationship;

            //console.log(this.get('store.adapter.serializer')); //typeForRelationship;
           // console.log(this.get('store.adapter.serializer.mappings')); //typeForRelationship;

            //var data = {};
           // data.notebook = parent.serialize({includeId: true});


           // this.get('store.adapter.serializer').addRelationships(data.notebook, parent);

            //var d = {};


            //this.get('store.adapter.serializer').extractEmbeddedType(Application.Notebook, d);

            //console.log('rel: ', this.get('store.adapter.serializer').extractEmbeddedType());

            //console.log('DATA WITH RELATIONSHIPS: ', JSON.stringify(data));

            console.log('root: ', this.get('store.adapter.serializer').rootForType(this));

           // console.log('loadFor: ', DS.loaderFor(this.get('store')));


            console.log('name: ', name);
            console.log('relationship: ', relationship);
            console.log('this: ', this);


            //var notebook = this.serialize({includeId: true});

            //this.get('store.adapter.serializer').addType(notebook, relationship.parentType);

            //var nominals = this.get('store.adapter.serializer').createSerializedForm();

            //this.get('store.adapter.serializer').addHasMany(d, relationship.type, relationship.key, relationship);
            //this.get('store.adapter.serializer').extractEmbeddedType(relationship, data);

             this.get('store.adapter.serializer').addHasMany(data, this, 'notebook', relationship);
            
            //this.get('store.adapter.serializer').addHasMany(notebook, relationship.type, relationship.key, relationship);

            //this.get('store.adapter.serializer').addRelationships(notebook, this);

            var nominals = this.get(relationship.key).toArray();

            data.hasMany = {};
            data.hasMany[relationship.key] = [];

            for(var index = 0; index != nominals.length; index++) {
                //console.log('nominal: ', nominals[index].serialize({includeId:true}));

                //notebook.nominals.push(nominals[index].serialize({includeId:true}));

                data.hasMany[relationship.key].push(nominals[index].id);
            }

            console.log('Notebook: ', JSON.stringify(data));

            //console.log('nominals: ', nominals.length);

            //console.log('nominals: ', this.get(relationship.key).toArray());



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

            //localStorage.setItem(data.notebook.id, JSON.stringify(data));

            //console.log('cacheFor: ', JSON.stringify(data));
          } //else if (relationship.kind === 'hasMany') {
            //console.log('hasMany: ', name, relationship);
            //console.log('cacheFor: ', record.cacheFor(name));
          //}
        }, record);


         localStorage.setItem(this.generateLocalStorageKey(record), JSON.stringify(data));

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
        var encrypted = localStorage.getItem(JSON.stringify(key));

        //var encrypted = localStorage.getItem(key);

        return JSON.parse(this.decrypt(encrypted));
    },
    loadLocalStorageRecords: function() {
        for (var index = 0; index < localStorage.length; index++) {
            var key = JSON.parse(localStorage.key(index));

            var value = this.loadLocalStorageRecord(key);

            this.get('adapter').load(this, Application[key.type], value, {});
        }

        for (var index = 0; index < localStorage.length; index++) {
            //var key = localStorage.key(index);
            var key = JSON.parse(localStorage.key(index));

  //          console.log('key: ', key);

            //if (key.username === sessionStorage.username) {
            var record = this.loadLocalStorageRecord(key);

                //console.log('record: ', record);

                //delete record.notebook.nominals[0].notebook_id;
                //delete record.notebook.nominals[1].notebook_id;

   //             console.log('record: ', JSON.stringify(record));

  //              this.get('adapter').load(this, Application[key.type], record, {});

                //this.get('adapter').load(this, Application.Notebook, record);

            var model = this.find(Application[key.type], record.id);
                //var model = this.find(Application.Notebook, record.id);

   //             model.get('stateManager').transitionTo('created');

                for(var property in record.hasMany) {
                    console.log('property: ', property);
                    var childern = record.hasMany[property];

                    console.log('childern: ', childern);

                    for (var i = 0; i != childern.length; i++) {
                        console.log('child: ', childern[i]);

                        var ck = {
                            id: childern[i],
                            type: 'Nominal'
                        };

                        var child = this.loadLocalStorageRecord(ck);

    //                    this.get('adapter').load(this, Application.Nominal, child, {});
                        //this.get('adapter').load(this, Application[Nominal], child, {});

                        //if (Ember.isNone(child)) {
                        //    console.log('find: ', this.find(Application.Nominal, childern[i]));
                            //model.get('property').pushObject(this.find(Application))
                        //} else {
     //                       console.log('load: ', child);
                        //}
                        var ch = this.find(Application.Nominal, child.id);

    //                    ch.get('stateManager').transitionTo('created');

                        model.get(property).pushObject(ch);
                    }
                }
                //model.resolve();
                //model.updateRecordArrays();

                //console.log('loaded model: ', model);

                //if (record.isDirty) {
                //    model.get('stateManager').transitionTo('created');
                //}

                //localStorage.removeItem(record.id);

                //this.extendModel(model);
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
            type: type//,
            //username: sessionStorage.username
        };

        return JSON.stringify(key);
    }
});

