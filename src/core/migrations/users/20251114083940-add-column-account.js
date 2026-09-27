exports.up = function (db, callback) {
  db.addColumn(
    "users",
    "account",
    {
      type: "string",
      length: 50,
      after: "phone",
    },
    function (err) {
      if (err) return callback(err);
      callback();
    }
  );
}

