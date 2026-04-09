import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sp_backend.models.user import User
from sp_backend.services.password.password_service import PasswordService
from sp_backend.constants.user import UserRole
from dotenv import load_dotenv
from sp_backend.db.session import DATABASE_URL


engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()


def seed_users():
    users = [
        User(
            full_name="Nguyen Thi Alice",
            role=UserRole.STAFF,
            email="staff.alice@uni.edu",
            hashed_password=PasswordService.hash_password("alice123456"),
        ),
        User(
            full_name="Tran Van Bob",
            role=UserRole.STAFF,
            email="staff.bob@uni.edu",
            hashed_password=PasswordService.hash_password("bob123456"),
        ),
        User(
            full_name="Le Hoang Charlie",
            role=UserRole.STUDENT,
            email="student.charlie@uni.edu",
            hashed_password=PasswordService.hash_password("charlie123456"),
        ),
        User(
            full_name="Pham Thi Diana",
            role=UserRole.STUDENT,
            email="student.diana@uni.edu",
            hashed_password=PasswordService.hash_password("diana123456"),
        ),
    ]
    session.add_all(users)
    session.flush()


def seed():
    seed_users()
    session.commit()
    print("Seed data inserted successfully.")


if __name__ == "__main__":
    seed()
