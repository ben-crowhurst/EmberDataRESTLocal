Application.Store = DS.Store.extend({
    revision: 12,
    adapter: Application.Adapter.create(),
    openCache: function(username, password) {
        Application.cache = Application.Cache.create();

        Application.cache.open(username, password);

        this.loadCache();

        this.overrideCreateRecord();
    },
    saveLocalStorageRecord: function(record) {
        var store = this;
        var adapter = store.get('adapter');
        var serializer = adapter.get('serializer');

        var serialized = record.serialize({includeId: true});

        serialized.meta = {};
        serialized.meta.dirty = record.get('isDirty');
        serialized.meta.type = record.constructor.toString();

        record.eachRelationship(function(name, relationship) {
            var record = this;

            if (relationship.kind === 'hasMany') {
                serializer.addHasMany(serialized, record, 'notebook', relationship);

                var nominals = record.get(relationship.key).toArray();

                serialized.meta.hasManyRelationships = {};
                serialized.meta.hasManyRelationships[relationship.key] = [];

                for(var index = 0; index != nominals.length; index++) {
                    serialized.meta.hasManyRelationships[relationship.key].push(nominals[index].id);
                }
            }
        }, record);

        Application.cache.set(record.get('id'), JSON.stringify(serialized));
    },
    loadCache: function() {
        var store = this;
        var adapter = store.get('adapter');

        Application.cache.each(function(id, type, object) {
            adapter.load(store, type, object);

            var meta = object.meta;

            if (!Ember.isNone(meta.hasManyRelationships)) {
                var model = store.find(type, id);

                model.one('didLoad', function() {
                    store.loadRelationships(model, meta);

                    //if (meta.dirty) {
                        //model.send('becomeDirty');
                        //model.get('stateManager').transitionTo('becomeDirty');
                        //model.get('stateManager').transitionTo('loaded.created.uncommitted');
                    //} else {
                    //    console.log(model, id);
                        //model.get('stateManager').transistionTo('created');
                    //    model.get('stateManager').transitionTo('loaded.updated');
                    //}
                });
            }

            //store._extend(model);
        });
    },
    loadRelationships: function(model, meta) {
        var store = this;

        for (var relationship in meta.hasManyRelationships) {
            var ids = meta.hasManyRelationships[relationship];

            for (var index = 0; index != ids.length; index++) {
                var id = ids[index];

                var child = Application.cache.get(id);

                var ch = store.find(Application[child.meta.type.substring(child.meta.type.indexOf('.') + 1)], id);

                model.get(relationship).pushObject(ch);
            }
        }
    },
    overrideCreateRecord: function() {
        var store = this;

        store.reopen({
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

                    console.log('isDirty saving...', this.get('id'));
                }
            }).observes('isDirty'),
            deleteLocalStorageRecord: $.debounce(1000, function() {
                if (this.get('isDeleted')) {
                    this.get('store').unloadLocalStorageRecord(this);
                }                
            }).observes('isDeleted')
        });

        //dataDidChange
    }
});

