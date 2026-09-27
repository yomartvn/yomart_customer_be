exports.up = function (db, callback) {
  db.createTable('permissions', {
    id: { 
      type: 'int', 
      primaryKey: true, 
      autoIncrement: true 
    },
    role_id: { 
      type: 'int'
    },
    module_detail_id: { 
      type: 'int'
    },
    create_id: { 
      type: 'int', 
      comment: 'ID người tạo' 
    },
    created_at: { 
      type: 'timestamp', 
      defaultValue: 'CURRENT_TIMESTAMP',
    },
    updated_at: { 
      type: 'timestamp', 
      defaultValue: 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP'
    }
  }, callback);
};
