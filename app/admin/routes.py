from flask import Blueprint, flash, redirect, render_template, request, url_for

from app.extensions import db
from app.models import Order, Product
from app.services.auth_utils import admin_required, current_user


admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/")
@admin_required
def dashboard():
    products = Product.query.order_by(Product.created_at.desc()).all()
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return render_template("admin/dashboard.html", products=products, orders=orders, user=current_user())


@admin_bp.route("/products/add", methods=["POST"])
@admin_required
def add_product():
    name = request.form.get("name", "").strip()
    description = request.form.get("description", "").strip()
    price = float(request.form.get("price", 0))
    image_url = request.form.get("image_url", "").strip()

    if not name or price <= 0:
        flash("菜品名称和正确价格为必填项。", "danger")
        return redirect(url_for("admin.dashboard"))

    product = Product(name=name, description=description or "暂无描述", price=price, image_url=image_url)
    db.session.add(product)
    db.session.commit()
    flash("菜品添加成功。", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.route("/products/<int:product_id>/edit", methods=["POST"])
@admin_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.name = request.form.get("name", product.name).strip() or product.name
    product.description = request.form.get("description", product.description).strip() or product.description
    product.price = float(request.form.get("price", product.price))
    product.image_url = request.form.get("image_url", product.image_url or "").strip()

    db.session.commit()
    flash("菜品更新成功。", "success")
    return redirect(url_for("admin.dashboard"))


@admin_bp.route("/products/<int:product_id>/delete", methods=["POST"])
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash("菜品删除成功。", "info")
    return redirect(url_for("admin.dashboard"))


@admin_bp.route("/orders/<int:order_id>/status", methods=["POST"])
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    status = request.form.get("status", "待处理")
    if status not in ["待处理", "已完成"]:
        flash("无效状态。", "danger")
        return redirect(url_for("admin.dashboard"))

    order.status = status
    db.session.commit()
    flash("订单状态更新成功。", "success")
    return redirect(url_for("admin.dashboard"))
