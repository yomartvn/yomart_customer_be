const tableName = "customer";

exports.up = function (db, callback) {
  db.createTable(
    tableName,
    {
      id: { type: "int", notNull: true, autoIncrement: true, primaryKey: true },
      code: {
        type: "string",
        length: 20,
        notNull: true,
        comment: "Mã khách hàng: KH-{6 ký tự} (VD: KH-000001)",
      },
      name: { type: "string", length: 255, notNull: true },
      phone: { type: "string", length: 20 },
      email: { type: "string", length: 255 },
      birthdate: { type: "date" },
      gender: {
        type: "int",
        comment: "0: Nữ, 1: Nam, 2: Khác",
      },
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
