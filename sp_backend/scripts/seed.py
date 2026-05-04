import os
from sp_backend.services.embedding.embedding_service import EmbeddingService
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sp_backend.models import *
from sp_backend.services.password.password_service import PasswordService
from sp_backend.constants.user import UserRole
from sp_backend.db.session import DATABASE_URL
from sp_backend.constants.forum import ForumCategory
from sp_backend.constants.content_type import ContentType
from sp_backend.constants.question import QuestionCategory, QuestionStatus
from sp_backend.constants.announcement import (
    AnnouncementCategory,
    AnnouncementPriority,
)
from datetime import timedelta, date
import random

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


def seed_forums():
    staff = session.query(User).filter_by(role=UserRole.STAFF).first()
    student = session.query(User).filter_by(role=UserRole.STUDENT).first()

    forums_data = [
        {
            "title": "Welcome to Academic Support!",
            "body": "This forum is for all academic-related questions and discussions.",
            "category": ForumCategory.ACADEMIC_SUPPORT,
            "posted_by": staff.id if staff else 1,
        },
        {
            "title": "Campus Life Tips",
            "body": "Share your experiences and tips about campus life!",
            "category": ForumCategory.CAMPUS_LIFE,
            "posted_by": student.id if student else 2,
        },
        {
            "title": "Career Services Announcements",
            "body": "Find the latest updates and advice from Career Services.",
            "category": ForumCategory.CAREER_SERVICES,
            "posted_by": staff.id if staff else 1,
        },
    ]
    forums = []
    for data in forums_data:
        embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
        forums.append(
            Forum(
                title=data["title"],
                body=data["body"],
                embedding=embedding,
                category=data["category"],
                posted_by=data["posted_by"],
            )
        )
    session.add_all(forums)
    session.flush()


def seed_comments():

    # Get users and content ids
    staff = session.query(User).filter_by(role=UserRole.STAFF).first()
    student = session.query(User).filter_by(role=UserRole.STUDENT).first()

    forum = session.query(Forum).first()
    question = session.query(Question).first()
    announcement = session.query(Announcement).first()
    comments = [
        Comment(
            content_type=ContentType.FORUM,
            content_id=forum.id if forum else 1,
            body="This is a helpful forum!",
            posted_by=student.id if student else 3,
        ),
        Comment(
            content_type=ContentType.QUESTION,
            content_id=question.id if question else 1,
            body="I have the same question!",
            posted_by=staff.id if staff else 1,
        ),
        Comment(
            content_type=ContentType.ANNOUNCEMENT,
            content_id=announcement.id if announcement else 1,
            body="Thanks for the update!",
            posted_by=student.id if student else 3,
        ),
    ]
    session.add_all(comments)
    session.flush()


def seed_reactions():
    """Seed reactions as 'likes' for posts (forums, questions, announcements)."""
    staff = session.query(User).filter_by(role=UserRole.STAFF).first()
    student = session.query(User).filter_by(role=UserRole.STUDENT).first()
    forum = session.query(Forum).first()
    question = session.query(Question).first()
    announcement = session.query(Announcement).first()
    reactions = [
        Reaction(
            content_type=ContentType.FORUM,
            content_id=forum.id if forum else 1,
            user_id=student.id if student else 3,
        ),
        Reaction(
            content_type=ContentType.QUESTION,
            content_id=question.id if question else 1,
            user_id=staff.id if staff else 1,
        ),
        Reaction(
            content_type=ContentType.ANNOUNCEMENT,
            content_id=announcement.id if announcement else 1,
            user_id=student.id if student else 3,
        ),
    ]
    session.add_all(reactions)
    session.flush()


def seed_content_daily_views():
    """Seed ContentDailyView for forums, questions, announcements."""
    from sp_backend.models.content_daily_view import ContentDailyView
    from datetime import date

    forum = session.query(Forum).first()
    question = session.query(Question).first()
    announcement = session.query(Announcement).first()
    today = date.today()
    views = [
        ContentDailyView(
            content_type=ContentType.FORUM,
            content_id=forum.id if forum else 1,
            content_date=today,
            views_count=10,
        ),
        ContentDailyView(
            content_type=ContentType.QUESTION,
            content_id=question.id if question else 1,
            content_date=today,
            views_count=5,
        ),
        ContentDailyView(
            content_type=ContentType.ANNOUNCEMENT,
            content_id=announcement.id if announcement else 1,
            content_date=today,
            views_count=7,
        ),
    ]
    session.add_all(views)
    session.flush()


def seed_questions():
    student = session.query(User).filter_by(role=UserRole.STUDENT).first()

    questions_data = [
        {
            "title": "How to register for courses?",
            "body": "Can someone explain the course registration process?",
            "category": QuestionCategory.ACADEMIC,
            "status": QuestionStatus.OPEN,
            "posted_by": student.id if student else 3,
        },
        {
            "title": "Where is the library?",
            "body": "I am new to campus. Where can I find the library?",
            "category": QuestionCategory.LIBRARY,
            "status": QuestionStatus.OPEN,
            "posted_by": student.id if student else 3,
        },
        {
            "title": "Career Fair registration",
            "body": "How do I register for the upcoming Career Fair?",
            "category": QuestionCategory.CAREER_SERVICES,
            "status": QuestionStatus.OPEN,
            "posted_by": student.id if student else 3,
        },
    ]
    questions = []
    for data in questions_data:
        embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
        questions.append(
            Question(
                title=data["title"],
                body=data["body"],
                embedding=embedding,
                category=data["category"],
                status=data["status"],
                posted_by=data["posted_by"],
            )
        )

    session.add_all(questions)
    session.flush()


def seed_reactions():
    """Seed reactions as 'likes' for posts (forums, questions, announcements)."""
    staff = session.query(User).filter_by(role=UserRole.STAFF).first()
    student = session.query(User).filter_by(role=UserRole.STUDENT).first()
    forum = session.query(Forum).first()
    question = session.query(Question).first()
    announcement = session.query(Announcement).first()
    reactions = [
        Reaction(
            content_type=ContentType.FORUM,
            content_id=forum.id if forum else 1,
            user_id=student.id if student else 3,
        ),
        Reaction(
            content_type=ContentType.QUESTION,
            content_id=question.id if question else 1,
            user_id=staff.id if staff else 1,
        ),
        Reaction(
            content_type=ContentType.ANNOUNCEMENT,
            content_id=announcement.id if announcement else 1,
            user_id=student.id if student else 3,
        ),
    ]
    session.add_all(reactions)
    session.flush()


def seed_content_daily_views():
    """Seed ContentDailyView for forums, questions, announcements."""

    forums = session.query(Forum).limit(3).all()
    question = session.query(Question).first()
    announcement = session.query(Announcement).first()
    today = date.today()
    views = []
    for idx, forum in enumerate(forums):
        base = random.randint(5, 30)
        for days_ago in range(4):
            fluctuation = random.randint(-3, 8)
            count = max(1, base + fluctuation - days_ago * random.randint(0, 4))
            views.append(
                ContentDailyView(
                    content_type=ContentType.FORUM,
                    content_id=forum.id,
                    content_date=today - timedelta(days=days_ago),
                    views_count=count,
                )
            )
    # Keep the question and announcement seeding as before
    views.append(
        ContentDailyView(
            content_type=ContentType.QUESTION,
            content_id=question.id if question else 1,
            content_date=today,
            views_count=random.randint(5, 20),
        )
    )
    views.append(
        ContentDailyView(
            content_type=ContentType.ANNOUNCEMENT,
            content_id=announcement.id if announcement else 1,
            content_date=today,
            views_count=random.randint(3, 15),
        )
    )
    session.add_all(views)
    session.flush()


def seed_announcements():
    staff = session.query(User).filter_by(role=UserRole.STAFF).first()

    announcements_data = [
        {
            "title": "Semester Start Announcement",
            "body": "Welcome to the new semester! Please check your schedules and course registrations.",
            "category": AnnouncementCategory.ACADEMIC,
            "priority": AnnouncementPriority.INFO,
            "posted_by": staff.id if staff else 1,
        },
        {
            "title": "Library Maintenance",
            "body": "The library will be closed for maintenance this weekend.",
            "category": AnnouncementCategory.LIBRARY,
            "priority": AnnouncementPriority.WARNING,
            "posted_by": staff.id if staff else 1,
        },
        {
            "title": "Career Fair 2026",
            "body": "Join the annual Career Fair to meet top employers and explore job opportunities!",
            "category": AnnouncementCategory.CAREER_SERVICES,
            "priority": AnnouncementPriority.NEW,
            "posted_by": staff.id if staff else 1,
        },
    ]
    announcements = []
    for data in announcements_data:
        embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
        announcements.append(
            Announcement(
                title=data["title"],
                body=data["body"],
                embedding=embedding,
                category=data["category"],
                priority=data["priority"],
                posted_by=data["posted_by"],
            )
        )
    session.add_all(announcements)
    session.flush()


def seed():
    seed_users()
    seed_forums()
    seed_announcements()
    seed_questions()
    seed_comments()
    seed_reactions()
    seed_content_daily_views()
    session.commit()
    print("Seed data inserted successfully.")


if __name__ == "__main__":
    seed()
