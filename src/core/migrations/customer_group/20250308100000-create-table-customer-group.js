const tableName = "customer_group";

exports.up = function (db, callback) {
  db.createTable(
    tableName,
    {
      id: { type: "int", notNull: true, autoIncrement: true, primaryKey: true },
      code: {
        type: "string",
        length: 20,
        notNull: true,
        comment: "Mã nhóm khách hàng: NKH-{6 ký tự} (VD: NKH-000001)",
      },
      name: { type: "string", length: 255, notNull: true },
      publish: {
        type: "int",
        notNull: true,
        defaultValue: 1,
        comment: "0: ẩn, 1: hiển thị",
      },
      seller_id: { type: "int", notNull: true },
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
