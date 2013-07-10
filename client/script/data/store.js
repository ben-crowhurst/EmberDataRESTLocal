Application.Store = DS.Store.extend({
    revision: 12,
    cache: Application.Cache.create(),
    adapter: Application.Adapter.create(),
    openCache: function(username, password) {
        var cache = this.get('cache');

        cache.open(username, password);

        this.loadCache();

        //this.overrideCreateRecord();
        //http://www.embercasts.com/episodes/client-side-authentication-part-2
    },
    saveLocalStorageRecord: function(record) {
        var store = this;
        var cache = store.get('cache');
        var adapter = store.get('adapter');
        var serializer = adapter.get('serializer');

        var serialized = record.serialize({includeId: true});

        serialized.meta = {};
        serialized.meta.dirty = record.get('isDirty');
        serialized.meta.type = record.constructor.toString();

        record.eachRelationship(function(name, relationship) {
            var record = this;

            if (relationship.kind === 'hasMany') {
                var tokens = relationship.parentType.toString().split('.');
                var parent = tokens[1].toLowerCase();

                serializer.addHasMany(serialized, record, parent, relationship);

                var records = record.get(relationship.key).toArray();

                serialized.meta.hasManyRelationships = {};
                serialized.meta.hasManyRelationships[relationship.key] = [];

                for(var index = 0; index != records.length; index++) {
                    serialized.meta.hasManyRelationships[relationship.key].push(records[index].id);
                }
            }
        }, record);

        cache.set(record.get('id'), JSON.stringify(serialized));
    },
    // unloadLocalStorageRecord: function(record) {
    //     console.log('deleting localstore record');

    //     var store = this;
    //     var cache = store.get('cache');

    //     cache.set(record.id, null);
    // },
    loadCache: function() {
        var store = this;
        var cache = store.get('cache');
        var adapter = store.get('adapter');

        cache.each(function(id, type, object) {
            adapter.load(store, type, object);

            var meta = object.meta;

            if (!Ember.isNone(meta.hasManyRelationships)) {
                var model = store.find(type, id);

                model.one('didLoad', function() {
                    store.loadRelationships(model, meta);

                    if (meta.dirty) {
                        model.send('becomeDirty');
                    }
                });
            }

            //http://stackoverflow.com/questions/15177723/delete-associated-model-with-ember-data
            //store._extend(model);
        });
    },
    loadRelationships: function(model, meta) {
        var store = this;
        var cache = store.get('cache');

        for (var relationship in meta.hasManyRelationships) {
            var ids = meta.hasManyRelationships[relationship];

            for (var index = 0; index != ids.length; index++) {
                var id = ids[index];

                var child = cache.get(id);

                var ch = store.find(Application[child.meta.type.substring(child.meta.type.indexOf('.') + 1)], id);

                model.get(relationship).pushObject(ch);
            }
        }
    },
    createRecord: function(type, properties, transaction) {
        properties.id = uuid.v4();

        var model = this._super.apply(this, arguments);

        Ember.run.once(this, function() {
            this.extendModel(model);

            this.saveLocalStorageRecord(model);
        });

        return model;
    },
    // overrideCreateRecord: function() {
    //     var store = this;

    //     store.reopen({
    //         createRecord: function(type, properties, transaction) {
    //             properties.id = uuid.v4();

    //             var model = this._super.apply(this, arguments);

    //             Ember.run.once(this, function() {
    //                 this.extendModel(model);

    //                 this.saveLocalStorageRecord(model);
    //             });

    //             return model;
    //         }
    //     });    
    // },
    extendModel: function(record) {
        record.reopen({
            // updateLocalStorageRecord: $.debounce(500, function() {
            //     if (!this.get('isDeleted')) {
            //         this.get('store').saveLocalStorageRecord(this);

            //         console.log('isDirty saving...', this.get('id'));
            //     }
            // }).observes('isDirty'),
            updateLocalStorageRecord: function() {
                if (!this.get('isDeleted')) {
                    this.get('store').saveLocalStorageRecord(this);

                    console.log('isDirty saving...', this.get('id'));
                }
            }.observes('isDirty'),
            didChangeData: function() {
                this._super.apply(this, arguments);
               console.log('did change data!!!');
            },
            deleteRecord: function() {
                this._super.apply(this, arguments);

                var store = this.get('store');
                var cache = store.get('cache');

                cache.set(record.id, null);
            }
            //deleteLocalStorageRecord: $.debounce(500, function() {
                //if (this.get('isDeleted')) {
            //        this.get('store').unloadLocalStorageRecord(this);
                //}
            //}).observes('isDeleted')
        });

        //dataDidChange
    }
});

