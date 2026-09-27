exports.up = function (db, callback) {
  db.addColumn(
    "menus",
    "link",
    {
      type: "string",
      notNull: false,
      after: "icon",
    },
    function (err) {
      if (err) return callback(err);
      db.addColumn(
        "menus",
        "target",
        {
          type: "string",
          notNull: false,
          after: "link",
        },
        function (err) {
          if (err) return callback(err);
          callback();
        }
      );
    })
}

