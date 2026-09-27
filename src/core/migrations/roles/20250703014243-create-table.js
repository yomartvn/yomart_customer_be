const tableName = "roles";
exports.up = function (db, callback) {
  db.createTable(
    tableName,
    {
      id: { type: "int", notNull: true, autoIncrement: true, primaryKey: true },
      name: { type: "string", length: 255, notNull: true },
      active: {
        type: "boolean",
        notNull: true,
        defaultValue: true,
        comment: "Trạng thái tài khoản: 0 vô hiệu hoá, 1: đang hoạt động",
      },
      create_id: { type: "int", comment: "ID người tạo" },
      created_at: { type: "timestamp", defaultValue: "CURRENT_TIMESTAMP" },
      updated_at: { type: "timestamp", defaultValue: "CURRENT_TIMESTAMP" },
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
