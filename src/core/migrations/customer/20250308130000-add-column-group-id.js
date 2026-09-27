exports.up = function (db, callback) {
  db.addColumn(
    "customer",
    "group_id",
    {
      type: "int",
      comment: "ID nhóm khách hàng",
      after: "seller_id",
    },
    function (err) {
      if (err) return callback(err);
      callback();
    }
  );
};

exports.down = function (db, callback) {
  db.removeColumn("customer", "group_id", callback);
};
