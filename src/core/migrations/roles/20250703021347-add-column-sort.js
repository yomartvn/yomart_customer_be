const tableName = "roles";
exports.up = function (db, callback) {
  db.addColumn(
    tableName,
    "sort",
    {
      type: "int",
      notNull: true,
      defaultValue: 0,
    },
    function (err) {
      if (err) {
        console.error(`Create ${tableName} table:`, err);
        return callback(err);
      }
      //console.log('users table created successfully');
      callback();
    }
  );
};
