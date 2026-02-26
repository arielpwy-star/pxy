from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from app.extensions import db
from app.models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if not username or not password:
            flash("用户名和密码不能为空。", "danger")
            return render_template("auth/register.html")

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash("用户名已存在。", "danger")
            return render_template("auth/register.html")

        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash("注册成功，请登录。", "success")
        return redirect(url_for("auth.login"))

    return render_template("auth/register.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        role = request.form.get("role", "user")

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            flash("用户名或密码错误。", "danger")
            return render_template("auth/login.html")

        if role == "admin" and not user.is_admin:
            flash("该账号不是管理员账号。", "danger")
            return render_template("auth/login.html")

        session["user_id"] = user.id
        session["is_admin"] = user.is_admin

        flash("登录成功。", "success")
        if user.is_admin:
            return redirect(url_for("admin.dashboard"))
        return redirect(url_for("main.index"))

    return render_template("auth/login.html")


@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("已退出登录。", "info")
    return redirect(url_for("main.index"))
