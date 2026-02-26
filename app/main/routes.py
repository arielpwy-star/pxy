from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from app.extensions import db
from app.models import Order, OrderItem, Product
from app.services.auth_utils import current_user, login_required


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template("main/index.html", products=products, user=current_user())


@main_bp.route("/products/<int:product_id>")
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    return render_template("main/product_detail.html", product=product, user=current_user())


@main_bp.route("/cart/add/<int:product_id>", methods=["POST"])
@login_required
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    quantity = int(request.form.get("quantity", 1))

    cart = session.get("cart", {})
    key = str(product.id)
    cart[key] = cart.get(key, 0) + max(1, quantity)
    session["cart"] = cart

    flash(f"{product.name} 已加入购物车。", "success")
    return redirect(url_for("main.cart"))


@main_bp.route("/cart")
@login_required
def cart():
    cart_data = session.get("cart", {})
    items = []
    total = 0

    for product_id_str, quantity in cart_data.items():
        product = Product.query.get(int(product_id_str))
        if not product:
            continue
        subtotal = product.price * quantity
        total += subtotal
        items.append({"product": product, "quantity": quantity, "subtotal": subtotal})

    return render_template("main/cart.html", items=items, total=total, user=current_user())


@main_bp.route("/cart/remove/<int:product_id>")
@login_required
def remove_from_cart(product_id):
    cart_data = session.get("cart", {})
    cart_data.pop(str(product_id), None)
    session["cart"] = cart_data
    flash("商品已移出购物车。", "info")
    return redirect(url_for("main.cart"))


@main_bp.route("/orders/submit", methods=["POST"])
@login_required
def submit_order():
    user = current_user()
    cart_data = session.get("cart", {})

    if not cart_data:
        flash("购物车为空，无法提交订单。", "warning")
        return redirect(url_for("main.index"))

    order = Order(user_id=user.id, status="待处理")
    total = 0

    for product_id_str, quantity in cart_data.items():
        product = Product.query.get(int(product_id_str))
        if not product:
            continue
        total += product.price * quantity
        item = OrderItem(product_id=product.id, quantity=quantity, unit_price=product.price)
        order.items.append(item)

    order.total_amount = total
    db.session.add(order)
    db.session.commit()

    session["cart"] = {}
    flash("订单提交成功。", "success")
    return redirect(url_for("main.my_orders"))


@main_bp.route("/orders")
@login_required
def my_orders():
    user = current_user()
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    return render_template("main/my_orders.html", orders=orders, user=user)
