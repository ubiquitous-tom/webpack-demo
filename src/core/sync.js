Backbone.sync = function Sync() {
  Backbone.ajaxSync.apply(this, arguments)
  return Backbone.localSync.apply(this, arguments)
}
// https://www.py4u.net/discuss/333075
