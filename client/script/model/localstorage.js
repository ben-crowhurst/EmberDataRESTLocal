Application.LocalStorageMixin = Ember.Mixin.create({
    onDirty: function() {
        console.log('im dirty');
    }.observes('isDirty')
});