exports.up = function (db, callback) {
  db.createTable('module_detail', {
    id: { 
      type: 'int', 
      primaryKey: true, 
      autoIncrement: true 
    },
    module_id: { 
      type: 'int', 
      notNull: true
    },
    action_label: { 
      type: 'string', 
      length: 255, 
      comment: 'Tên thao tác' 
    },
    action: { 
      type: 'string', 
      length: 255, 
      comment: 'Thao tác' 
    },
    sort: { 
      type: 'int',
      defaultValue: 0,
      comment: 'Thứ tự sắp xếp' 
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
