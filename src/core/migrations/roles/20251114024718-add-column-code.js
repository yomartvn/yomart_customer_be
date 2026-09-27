exports.up = function (db, callback) {
  db.addColumn(
    "roles",
    "code",
    {
      type: "string",
      notNull: true,
      after: "id",
    },
    function (err) {
      if (err) return callback(err);
      callback();
    }
  );
}

