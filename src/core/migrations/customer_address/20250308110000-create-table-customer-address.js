const tableName = "customer_address";

exports.up = function (db, callback) {
  db.createTable(
    tableName,
    {
      id: { type: "int", notNull: true, autoIncrement: true, primaryKey: true },
      name: {
        type: "string",
        length: 255,
        notNull: true,
        comment: "Tên địa chỉ (VD: Nhà riêng, Cơ quan)",
      },
      publish: {
        type: "int",
        notNull: true,
        defaultValue: 1,
        comment: "0: ẩn, 1: hiển thị",
      },
      is_default: {
        type: "int",
        notNull: true,
        defaultValue: 0,
        comment: "0: không mặc định, 1: địa chỉ mặc định",
      },
      customer_id: { type: "int", notNull: true },
      city_id: { type: "int", comment: "ID tỉnh/thành" },
      ward_id: { type: "int", comment: "ID phường/xã" },
      address: { type: "text", comment: "Địa chỉ chi tiết" },
      create_id: { type: "int", comment: "ID người tạo" },
      created_at: { type: "timestamp", defaultValue: "CURRENT_TIMESTAMP" },
      updated_at: { type: "timestamp", defaultValue: "CURRENT_TIMESTAMP" },
    },
    function (err) {
      if (err) {
        console.error(`Create ${tableName} table:`, err);
        return callback(err);
      }
      callback();
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable(tableName, callback);
};
