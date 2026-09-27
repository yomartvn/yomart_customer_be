const tableName = "user_roles";
exports.up = function (db, callback) {
  db.createTable(
    tableName,
    {
      id: { type: "int", notNull: true, autoIncrement: true, primaryKey: true },
      user_id: { type: "int", notNull: true },
      role_id: { type: "int", notNull: true },
      created_at: { type: "timestamp", defaultValue: "CURRENT_TIMESTAMP" },
    },
    function (err) {
      if (err) {
        console.error(`Create ${tableName} table:`, err);
        return callback(err);
      }
      
      db.addIndex(
        "user_roles",
        "unique_user_role",
        ["user_id", "role_id"],
        true,
        callback
      );
    }
  );
};
