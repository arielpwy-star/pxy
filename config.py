import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'food_ordering.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
