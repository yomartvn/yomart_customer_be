exports.up = function (db, callback) {
  db.addColumn(
    "customer_address",
    "address_type",
    {
      type: "string",
      length: 50,
      notNull: true,
      defaultValue: "nha_rieng",
      comment: "Loại địa chỉ: nha_rieng / van_phong",
      after: "name",
    },
    function (err) {
      if (err) return callback(err);
      callback();
    }
  );
};

exports.down = function (db, callback) {
  db.removeColumn("customer_address", "address_type", callback);
};
