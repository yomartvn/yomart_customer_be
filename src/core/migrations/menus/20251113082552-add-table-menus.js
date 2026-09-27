exports.up = function(db) {
  return db.createTable('menus', {
    id: { 
      type: 'int', 
      primaryKey: true, 
      autoIncrement: true,
      notNull: true 
    },
    name: { 
      type: 'string', 
      length: 255,
      notNull: true 
    },
    parent_id: { 
      type: 'int',
    },
    key: { 
      type: 'string', 
      length: 255
    },
    icon: { 
      type: 'string', 
      length: 255
    },
    module_id: { 
      type: 'int'
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
  });
};
