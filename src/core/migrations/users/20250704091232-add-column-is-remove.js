'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.addColumn('users', 'is_remove', {
    type: 'boolean',
    notNull: true,
    defaultValue: false
  }).then(function() {
    return db.runSql('ALTER TABLE users MODIFY COLUMN is_remove BOOLEAN NOT NULL DEFAULT FALSE AFTER active');
  });
};

exports._meta = {
  "version": 1
};