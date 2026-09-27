const tableName = "roles";

exports.up = function (db, callback) {
  const sql = `
    ALTER TABLE \`${tableName}\`
    ADD COLUMN \`is_default\` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Trạng thái: 0 là không mặc định, 1 là mặc định'
    AFTER \`sort\`;
  `;
  db.runSql(sql, function (err) {
    if (err) {
      console.error(`Add is_default column to ${tableName} table:`, err);
      return callback(err);
    }
    callback();
  });
};
