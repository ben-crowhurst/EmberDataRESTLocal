Application.Cache = Ember.Object.extend({
    open: function(username, password) {
        sessionStorage.username = username;

        sessionStorage.passphrase = CryptoJS.PBKDF2(username, password, {
            keySize: 256/32
        }).toString();
    },
    each: function(callback) {
        var cache = this;

        for (var index = 0; index < localStorage.length; index++) {
            var key = localStorage.key(index);

            var id = key.split(':')[1];

            var value = cache.get(id);

            var type = value.meta.type.substring(value.meta.type.indexOf('.') + 1);

            callback(id, Application[type], value);
        }
    },
    get: function(id) {
        var key = sessionStorage.username + ':' + id;

        var encrypted = localStorage.getItem(key);

        var value = encrypted; //CryptoJS.AES.decrypt(encrypted, sessionStorage.passphrase);

        return JSON.parse(value.toString(CryptoJS.enc.Utf8));
    },
    set: function(id, object) {
        var key = sessionStorage.username + ':' + id;

        if (object != null) {
            var value = object; //CryptoJS.AES.encrypt(object, sessionStorage.passphrase);
            
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key, null);
        }
    }
});