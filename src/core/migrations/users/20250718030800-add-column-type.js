const tableName = "users";

exports.up = function (db, callback) {
  const sql = `
    ALTER TABLE \`${tableName}\`
    ADD COLUMN \`type\` VARCHAR(255) NOT NULL
    AFTER \`is_remove\`;
  `;
  db.runSql(sql, function (err) {
    if (err) {
      console.error(`Add type column to ${tableName} table:`, err);
      return callback(err);
    }
    callback();
  });
};
