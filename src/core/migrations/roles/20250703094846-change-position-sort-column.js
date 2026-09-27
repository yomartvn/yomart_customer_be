const tableName = "roles";

exports.up = function (db, callback) {
  const sql = `
    ALTER TABLE ${tableName}
    CHANGE COLUMN active publish TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái: 0 là ẩn, 1 là hiển thị',

    MODIFY COLUMN sort INT NOT NULL DEFAULT 0 AFTER publish;
  `;

  db.runSql(sql, function (err) {
    if (err) {
      console.error(`Update table ${tableName}:`, err);
      return callback(err);
    }
    callback();
  });
};
