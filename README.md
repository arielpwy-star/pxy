# Flask 网上订餐系统（面试项目）

一个基于 **Python 3 + Flask + SQLite + SQLAlchemy** 的教学级网上订餐系统，包含用户端与管理员端核心流程，适合面试展示。

## 1. 技术栈
- Python 3
- Flask（蓝图结构）
- Flask-SQLAlchemy（ORM）
- SQLite
- Session 登录状态管理
- Bootstrap 5 + HTML/CSS

## 2. 项目目录结构

```text
pxy/
├── app/
│   ├── admin/
│   │   └── routes.py
│   ├── auth/
│   │   └── routes.py
│   ├── main/
│   │   └── routes.py
│   ├── services/
│   │   └── auth_utils.py
│   ├── __init__.py
│   ├── extensions.py
│   └── models.py
├── instance/
│   └── food_ordering.db   # 运行后自动生成
├── scripts/
│   └── init_data.py
├── static/
│   └── css/
│       └── style.css
├── templates/
│   ├── admin/
│   │   └── dashboard.html
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── main/
│   │   ├── cart.html
│   │   ├── index.html
│   │   ├── my_orders.html
│   │   └── product_detail.html
│   └── base.html
├── config.py
├── requirements.txt
├── run.py
└── README.md
```

## 3. 功能说明

### 用户端
- 用户注册 / 登录 / 退出
- 浏览菜品列表
- 查看菜品详情
- 加入购物车、删除购物车商品
- 提交订单
- 查看个人历史订单

### 管理员端
- 管理员登录
- 菜品新增、修改、删除
- 查看所有订单
- 修改订单状态（待处理 / 已完成）

## 4. 数据表设计
- `users`（用户）
- `products`（菜品）
- `orders`（订单）
- `order_items`（订单详情）

## 5. 运行步骤

```bash
# 1) 创建虚拟环境（可选）
python -m venv .venv
source .venv/bin/activate

# 2) 安装依赖
pip install -r requirements.txt

# 3) 初始化测试数据
python scripts/init_data.py

# 4) 启动项目
python run.py
```

浏览器访问：`http://127.0.0.1:5000`

## 6. 测试账号
- 管理员：`admin / admin123`
- 普通用户：`user1 / user123`

> 提示：这是面试可控项目，重在展示 Flask 项目结构、数据库设计和基础业务流程。
