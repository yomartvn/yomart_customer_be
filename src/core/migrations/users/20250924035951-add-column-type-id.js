const tableName = "users";

exports.up = function (db, callback) {
  const sql = `
    ALTER TABLE \`${tableName}\`
    ADD COLUMN \`type_id\` INT NULL
    AFTER \`type\`;
  `;
  db.runSql(sql, function (err) {
    if (err) {
      return callback(err);
    }
    callback();
  });
};
