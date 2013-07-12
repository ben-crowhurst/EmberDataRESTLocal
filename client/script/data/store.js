Application.Store = DS.Store.extend({
    adapter: Application.Adapter.create(),
    username: function(key, value) {
        if (arguments.length !== 1) {
            sessionStorage.username = value;
        }

        return sessionStorage.username;
    }.property(),
    passphrase: function() {
        return sessionStorage.passphrase;
    }.property(),
    _generatePassphrase: function(username, password) {
        sessionStorage.passphrase = CryptoJS.PBKDF2(username, password, {
            keySize: 256/32
        }).toString();
    },
    loadRecordCache: function(username, password) {
        var store = this;
        var adapter = store.get('adapter');

        store.set('username', username);

        store._generatePassphrase(username, password);

        for (var index = 0; index < localStorage.length; index++) {
            var key = localStorage.key(index);

            var id = key.substring(0, username.length);

            if (username === key.substring(0, username.length)) {
                //var value = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem(key), sessionStorage.passphrase).toString(CryptoJS.enc.Utf8));
                var value = JSON.parse(localStorage.getItem(key));
                var meta = value.meta;
                var type = meta.type;
            
                adapter.load(store, Application[type], value);
            }
        }

        store._loadRecordCacheRelationships();

        store._extendModel();
    },
    _loadRecordCacheRelationships: function() {
        var store = this;

        for (var index = 0; index < localStorage.length; index++) {
            var key = localStorage.key(index);

            var username = store.get('username');

            if (username === key.substring(0, username.length)) {
                //var value = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem(key), sessionStorage.passphrase).toString(CryptoJS.enc.Utf8));
                var value = JSON.parse(localStorage.getItem(key));
                var meta = value.meta;
                var type = meta.type;

                if (!Ember.isNone(meta.hasManyRelationships)) {
                    var model = store.find(Application[type], value.id);

                    for (var relationship in meta.hasManyRelationships) {
                        var ids = meta.hasManyRelationships[relationship];

                        for (var length = 0; length != ids.length; length++) {
                            var id = ids[length];

                            var child = JSON.parse(localStorage.getItem(store.get('username') + ':' + id));
                            //var child = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem(store.get('username') + ':' + id), sessionStorage.passphrase).toString(CryptoJS.enc.Utf8));

                            var ch = store.find(Application[child.meta.type], id);

                            model.get(relationship).pushObject(ch);
                        }
                    }

                    if (meta.dirty) {
                        model.send('becomeDirty');
                    }
                }
            }
        }
    },
    _extendModel: function() {
        DS.Model.reopenClass({
          createRecord: function(type, properties, transaction) {
            var record = this._super.apply(this, arguments);

            Ember.run.once(record, function() {
              var record = this;
              var store = record.get('store');

              store.saveRecordCache(record);
            });

            return record;
          }
        });

        DS.Model.reopen({
          deleteRecord: function() {
            var record = this;
            record._super.apply(record, arguments);

            var store = this.get('store');

            var key = store.get('username') + ':' + record.get('id');

            localStorage.removeItem(key);
          },
          send: function(name, context) {
            var record = this;

            record._super.apply(this, arguments);

             if (name === 'becomeDirty' || name === 'didSetProperty' || (name === 'didCommit' && !record.get('isDeleted'))) {
                Ember.run.debounce(this, function() {
                  var record = this;
                  var store = record.get('store');

                  store.saveRecordCache(record);
                }, 500);
             }
          }
        });
    },
    saveRecordCache: function(record) {
        var store = this;
        var adapter = store.get('adapter');
        var serializer = adapter.get('serializer');

        var key = store.get('username') + ':' + record.get('id');

        var serialized = record.serialize({includeId:true});
        serialized.meta = {};
        serialized.meta.dirty = record.get('isDirty');
        serialized.meta.type = record.constructor.toString().split('.')[1];

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
          } else if (relationship.kind === 'belongsTo') {
              var parent = record.get(relationship.key);

              if (!Ember.isNone(parent)) {
                store.saveRecordCache(parent);
              }
          }
        }, record);

        var value = JSON.stringify(serialized);
        //var value = CryptoJS.AES.encrypt(JSON.stringify(serialized), store.get('passphrase'));

        localStorage.setItem(key, value);
    }
});