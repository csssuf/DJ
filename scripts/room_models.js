$(function() {
  var models = window.models = {};

  models.User = Backbone.Model.extend({
    defaults: {
      admin: false,
      dj: false
    }
  });

  models.Users = Backbone.Collection.extend({
    model: models.User,

    initialize: function() {
      this.on('add', this.userAdded, this);
      this.on('remove', this.userRemoved, this);
    },

    userAdded: function(user) {
      user.collection = this;
    },

    userRemoved: function(user) {
      if (user.collection === this)
        user.collection = null;
    },

    getUser: function(username) {
      return this.findWhere({ username: username });
    },

    removeByUsername: function(username) {
      var user = this.getUser(username);
      if (user) this.remove(user);
      return user;
    }
  });

  models.Room = Backbone.Model.extend({
    defaults: {
      anonymous_listeners: 0,
      connected: false,
      listeners: new models.Users(),
      djs: new models.Users()
    },

    reset: function() {
      this.set(this.defaults);
      this.get('listeners').reset();
      this.get('djs').reset();
    },

    addUser: function(user) {
      var djs = this.get('djs');
      var listeners = this.get('listeners');

      if (!(user instanceof models.User))
        user = new models.User(user);

      user.on('change:dj', this.userDjChanged, this);

      if (user.get('dj'))
        djs.add(user);
      else
        listeners.add(user);
    },

    removeUser: function(username) {
      var dj = this.get('djs').removeByUsername(username);
      var listener = this.get('listeners').removeByUsername(username);

      var user = dj || listener;
      if (user)
        user.off('change:dj');
    },

    userDjChanged: function(user) {
      var dj = user.get('dj');
      if (dj) {
        listeners.remove(user);
        djs.add(user);
      } else {
        djs.remove(user);
        listeners.add(user);
      }
    },

    getUser: function(username) {
      var djs = this.get('djs');
      var listeners = this.get('listeners');
      return djs.getUser(username) || listeners.getUser(username);
    }
  });
});
