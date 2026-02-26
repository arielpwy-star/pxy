"""初始化测试数据：管理员账号、普通用户账号、示例菜品。"""

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Product, User


app = create_app()

with app.app_context():
    db.create_all()

    if not User.query.filter_by(username="admin").first():
        admin = User(username="admin", is_admin=True)
        admin.set_password("admin123")
        db.session.add(admin)

    if not User.query.filter_by(username="user1").first():
        user = User(username="user1", is_admin=False)
        user.set_password("user123")
        db.session.add(user)

    if Product.query.count() == 0:
        sample_products = [
            Product(name="宫保鸡丁", description="经典川菜，微辣下饭", price=28.0),
            Product(name="番茄牛腩饭", description="酸甜开胃，牛肉软烂", price=36.0),
            Product(name="香菇青菜", description="清淡爽口", price=18.0),
        ]
        db.session.add_all(sample_products)

    db.session.commit()
    print("测试数据初始化完成。")
