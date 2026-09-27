exports.up = function (db, callback) {
  db.createTable('modules', {
    id: { 
      type: 'int', 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: 'string', 
      length: 255, 
      notNull: true
    },
    parent_id: { 
      type: 'int'
    },
    module_name: { 
      type: 'string', 
      length: 255
    },
    publish: { 
      type: 'boolean', 
      notNull: true, 
      defaultValue: true, 
      comment: 'Trạng thái: 0 ẩn, 1: hiển thị' 
    },
    sort: { 
      type: 'int',
      defaultValue: 0,
      comment: 'Thứ tự sắp xếp' 
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
