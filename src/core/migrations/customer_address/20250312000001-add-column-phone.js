exports.up = function (db, callback) {
  db.addColumn(
    "customer_address",
    "phone",
    {
      type: "string",
      length: 20,
      notNull: true,
      defaultValue: "",
      comment: "Số điện thoại liên hệ (định dạng: 0xxxxxxxxx)",
      after: "address",
    },
    function (err) {
      if (err) return callback(err);
      callback();
    }
  );
};

exports.down = function (db, callback) {
  db.removeColumn("customer_address", "phone", callback);
};
