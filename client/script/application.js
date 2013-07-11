window.Application = Ember.Application.create({
    LOG_BINDING: true,
    LOG_TRANSITIONS: true
});

// DS.Model.reopenClass({
//   createRecord: function(type, properties, transaction) {
//     var record = this._super.apply(this, arguments);

//     Ember.run.once(record, function() {
//       var record = this;
//       var store = record.get('store');

//       store.saveRecordCache(record);
//     });

//     return record;
//   }
// });

// DS.Model.reopen({
//   deleteRecord: function() {
//     var record = this;
//     record._super.apply(record, arguments);

//     var store = this.get('store');

//     var key = store.get('username') + ':' + record.get('id');

//     localStorage.removeItem(key);
//   },
//   send: function(name, context) {
//     var record = this;

//     record._super.apply(this, arguments);

//      if (name === 'didSetProperty' || (name === 'didCommit' && !record.get('isDeleted'))) {
//         Ember.run.debounce(this, function() {
//           var record = this;
//           var store = record.get('store');

//           store.saveRecordCache(record);
//         }, 500);
//      }
//   }
// });