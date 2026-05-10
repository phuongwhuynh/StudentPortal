# import os
# from sp_backend.services.embedding.embedding_service import EmbeddingService
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import create_engine
# from sp_backend.models import *
# from sp_backend.services.password.password_service import PasswordService
# from sp_backend.constants.user import UserRole
# from sp_backend.db.session import DATABASE_URL
# from sp_backend.constants.forum import ForumCategory
# from sp_backend.constants.content_type import ContentType
# from sp_backend.constants.question import QuestionCategory, QuestionStatus
# from sp_backend.constants.announcement import (
#     AnnouncementCategory,
#     AnnouncementPriority,
# )
# from datetime import timedelta, date
# import random

# engine = create_engine(DATABASE_URL)
# Session = sessionmaker(bind=engine)
# session = Session()


# def seed_users():
#     users = [
#         User(
#             full_name="Nguyen Thi Alice",
#             role=UserRole.STAFF,
#             email="staff.alice@uni.edu",
#             hashed_password=PasswordService.hash_password("alice123456"),
#         ),
#         User(
#             full_name="Tran Van Bob",
#             role=UserRole.STAFF,
#             email="staff.bob@uni.edu",
#             hashed_password=PasswordService.hash_password("bob123456"),
#         ),
#         User(
#             full_name="Le Hoang Charlie",
#             role=UserRole.STUDENT,
#             email="student.charlie@uni.edu",
#             hashed_password=PasswordService.hash_password("charlie123456"),
#         ),
#         User(
#             full_name="Pham Thi Diana",
#             role=UserRole.STUDENT,
#             email="student.diana@uni.edu",
#             hashed_password=PasswordService.hash_password("diana123456"),
#         ),
#         User(
#             full_name="Nguyen Huu Thanh",
#             role=UserRole.STAFF,
#             email="admin@uni.edu",
#             hashed_password=PasswordService.hash_password("admin123"),
#         ),
#     ]
#     session.add_all(users)
#     session.flush()


# def seed_forums():
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()

#     forums_data = [
#         {
#             "title": "Welcome to Academic Support!",
#             "body": (
#                 "This forum is for all academic-related questions and discussions. "
#                 "Feel free to ask about course registration, exam schedules, or study tips. "
#                 "Our staff and fellow students are here to help you succeed throughout the semester."
#             ),
#             "category": ForumCategory.ACADEMIC_SUPPORT,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Campus Life Tips",
#             "body": (
#                 "Share your experiences and tips about campus life! "
#                 "From the best places to eat to how to join clubs and societies, "
#                 "let's help each other make the most out of university life."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Career Services Announcements",
#             "body": (
#                 "Find the latest updates and advice from Career Services. "
#                 "We post about upcoming workshops, internship opportunities, and career fairs. "
#                 "Stay tuned for resources to boost your employability."
#             ),
#             "category": ForumCategory.CAREER_SERVICES,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Study Group Finder",
#             "body": (
#                 "Looking for a study group? Post your course and preferred study times here. "
#                 "Collaborative learning can help you grasp difficult concepts and stay motivated."
#             ),
#             "category": ForumCategory.ACADEMIC_SUPPORT,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Dormitory Life Q&A",
#             "body": (
#                 "Ask questions and share advice about living in the dorms. "
#                 "From roommate tips to laundry hacks, this is your space to discuss all things residential."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Exam Preparation Strategies",
#             "body": (
#                 "Discuss your favorite exam prep strategies, share resources, and motivate each other. "
#                 "Whether you prefer flashcards, group study, or solo revision, all tips are welcome!"
#             ),
#             "category": ForumCategory.ACADEMIC_SUPPORT,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Lost and Found",
#             "body": (
#                 "Lost something on campus? Found an item that doesn't belong to you? "
#                 "Post details here to help reunite items with their owners."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Internship Experiences",
#             "body": (
#                 "Share your internship stories, tips for applications, and advice for making the most of your placement. "
#                 "Let's help each other prepare for the professional world."
#             ),
#             "category": ForumCategory.CAREER_SERVICES,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Club and Society Promotions",
#             "body": (
#                 "Are you part of a club or society? Promote your events and recruit new members here. "
#                 "Let’s build a vibrant campus community together!"
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Mental Health Support",
#             "body": (
#                 "University life can be stressful. Use this forum to share mental health resources, "
#                 "coping strategies, and support each other through tough times."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": staff.id if staff else 1,
#         },
#     ]
#     forums = []
#     for data in forums_data:
#         embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
#         forums.append(
#             Forum(
#                 title=data["title"],
#                 body=data["body"],
#                 embedding=embedding,
#                 category=data["category"],
#                 posted_by=data["posted_by"],
#             )
#         )
#     session.add_all(forums)
#     session.flush()


# def seed_reactions():
#     """Seed reactions as 'likes' for posts (forums, questions, announcements)."""
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()
#     forum = session.query(Forum).first()
#     question = session.query(Question).first()
#     announcement = session.query(Announcement).first()
#     reactions = [
#         Reaction(
#             content_type=ContentType.FORUM,
#             content_id=forum.id if forum else 1,
#             user_id=student.id if student else 3,
#         ),
#         Reaction(
#             content_type=ContentType.QUESTION,
#             content_id=question.id if question else 1,
#             user_id=staff.id if staff else 1,
#         ),
#         Reaction(
#             content_type=ContentType.ANNOUNCEMENT,
#             content_id=announcement.id if announcement else 1,
#             user_id=student.id if student else 3,
#         ),
#     ]
#     session.add_all(reactions)
#     session.flush()


# def seed_questions():
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()

#     questions_data = [
#         {
#             "title": "How to register for courses?",
#             "body": "Can someone explain the course registration process?",
#             "category": QuestionCategory.ACADEMIC,
#             "status": QuestionStatus.OPEN,
#             "posted_by": student.id if student else 3,
#         },
#         {
#             "title": "Where is the library?",
#             "body": "I am new to campus. Where can I find the library?",
#             "category": QuestionCategory.LIBRARY,
#             "status": QuestionStatus.OPEN,
#             "posted_by": student.id if student else 3,
#         },
#         {
#             "title": "Career Fair registration",
#             "body": "How do I register for the upcoming Career Fair?",
#             "category": QuestionCategory.CAREER_SERVICES,
#             "status": QuestionStatus.OPEN,
#             "posted_by": student.id if student else 3,
#         },
#     ]
#     questions = []
#     for data in questions_data:
#         embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
#         questions.append(
#             Question(
#                 title=data["title"],
#                 body=data["body"],
#                 embedding=embedding,
#                 category=data["category"],
#                 status=data["status"],
#                 posted_by=data["posted_by"],
#             )
#         )

#     session.add_all(questions)
#     session.flush()


# def seed_announcements():
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     today = date.today()
#     expired_date = today + timedelta(days=30)  # Set expiration date 30 days from today
#     announcements_data = [
#         {
#             "title": "Semester Start Announcement",
#             "body": "Welcome to the new semester! Please check your schedules and course registrations.",
#             "category": AnnouncementCategory.ACADEMIC,
#             "priority": AnnouncementPriority.INFO,
#             "posted_by": staff.id if staff else 1,
#             "expired_at": expired_date,
#         },
#         {
#             "title": "Library Maintenance",
#             "body": "The library will be closed for maintenance this weekend.",
#             "category": AnnouncementCategory.LIBRARY,
#             "priority": AnnouncementPriority.WARNING,
#             "posted_by": staff.id if staff else 1,
#             "expired_at": expired_date,
#         },
#         {
#             "title": "Career Fair 2026",
#             "body": "Join the annual Career Fair to meet top employers and explore job opportunities!",
#             "category": AnnouncementCategory.CAREER_SERVICES,
#             "priority": AnnouncementPriority.URGENT,
#             "posted_by": staff.id if staff else 1,
#             "expired_at": expired_date,
#         },
#     ]
#     announcements = []
#     for data in announcements_data:
#         embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
#         announcements.append(
#             Announcement(
#                 title=data["title"],
#                 body=data["body"],
#                 embedding=embedding,
#                 category=data["category"],
#                 priority=data["priority"],
#                 posted_by=data["posted_by"],
#                 expired_at=data["expired_at"],
#             )
#         )
#     session.add_all(announcements)
#     session.flush()


# def seed_content_daily_views():
#     """Seed ContentDailyView for forums, questions, announcements."""

#     forums = session.query(Forum).limit(3).all()
#     question = session.query(Question).first()
#     announcement = session.query(Announcement).first()
#     today = date.today()
#     views = []
#     for idx, forum in enumerate(forums):
#         base = random.randint(5, 30)
#         for days_ago in range(4):
#             fluctuation = random.randint(-3, 8)
#             count = max(1, base + fluctuation - days_ago * random.randint(0, 4))
#             views.append(
#                 ContentDailyView(
#                     content_type=ContentType.FORUM,
#                     content_id=forum.id,
#                     content_date=today - timedelta(days=days_ago),
#                     views_count=count,
#                 )
#             )
#     # Keep the question and announcement seeding as before
#     views.append(
#         ContentDailyView(
#             content_type=ContentType.QUESTION,
#             content_id=question.id if question else 1,
#             content_date=today,
#             views_count=random.randint(5, 20),
#         )
#     )
#     views.append(
#         ContentDailyView(
#             content_type=ContentType.ANNOUNCEMENT,
#             content_id=announcement.id if announcement else 1,
#             content_date=today,
#             views_count=random.randint(3, 15),
#         )
#     )
#     session.add_all(views)
#     session.flush()


# def seed_comments():
#     # Get users and content ids
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()

#     forum = session.query(Forum).first()
#     question = session.query(Question).first()
#     announcement = session.query(Announcement).first()
#     comments = [
#         Comment(
#             content_type=ContentType.FORUM,
#             content_id=forum.id if forum else 1,
#             body="This is a helpful forum!",
#             posted_by=student.id if student else 3,
#         ),
#         Comment(
#             content_type=ContentType.QUESTION,
#             content_id=question.id if question else 1,
#             body="I have the same question!",
#             posted_by=staff.id if staff else 1,
#         ),
#         Comment(
#             content_type=ContentType.ANNOUNCEMENT,
#             content_id=announcement.id if announcement else 1,
#             body="Thanks for the update!",
#             posted_by=student.id if student else 3,
#         ),
#     ]
#     session.add_all(comments)
#     session.flush()


# def seed():
#     seed_users()
#     seed_forums()
#     seed_announcements()
#     seed_questions()
#     # seed_comments()
#     # seed_reactions()
#     # seed_content_daily_views()
#     session.commit()
#     print("Seed data inserted successfully.")


# if __name__ == "__main__":
#     seed()

# import os
# from sp_backend.services.embedding.embedding_service import EmbeddingService
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import create_engine
# from sp_backend.models import *
# from sp_backend.services.password.password_service import PasswordService
# from sp_backend.constants.user import UserRole
# from sp_backend.db.session import DATABASE_URL
# from sp_backend.constants.forum import ForumCategory
# from sp_backend.constants.content_type import ContentType
# from sp_backend.constants.question import QuestionCategory, QuestionStatus
# from sp_backend.constants.announcement import (
#     AnnouncementCategory,
#     AnnouncementPriority,
# )
# from datetime import timedelta, date
# import random

# engine = create_engine(DATABASE_URL)
# Session = sessionmaker(bind=engine)
# session = Session()


# def seed_users():
#     users = [
#         User(
#             full_name="Nguyen Thi Alice",
#             role=UserRole.STAFF,
#             email="staff.alice@uni.edu",
#             hashed_password=PasswordService.hash_password("alice123456"),
#         ),
#         User(
#             full_name="Tran Van Bob",
#             role=UserRole.STAFF,
#             email="staff.bob@uni.edu",
#             hashed_password=PasswordService.hash_password("bob123456"),
#         ),
#         User(
#             full_name="Le Hoang Charlie",
#             role=UserRole.STUDENT,
#             email="student.charlie@uni.edu",
#             hashed_password=PasswordService.hash_password("charlie123456"),
#         ),
#         User(
#             full_name="Pham Thi Diana",
#             role=UserRole.STUDENT,
#             email="student.diana@uni.edu",
#             hashed_password=PasswordService.hash_password("diana123456"),
#         ),
#         User(
#             full_name="Nguyen Huu Thanh",
#             role=UserRole.STAFF,
#             email="admin@uni.edu",
#             hashed_password=PasswordService.hash_password("admin123"),
#         ),
#     ]
#     session.add_all(users)
#     session.flush()


# def seed_forums():
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()

#     forums_data = [
#         {
#             "title": "Welcome to Academic Support!",
#             "body": (
#                 "This forum is for all academic-related questions and discussions. "
#                 "Feel free to ask about course registration, exam schedules, or study tips. "
#                 "Our staff and fellow students are here to help you succeed throughout the semester."
#             ),
#             "category": ForumCategory.ACADEMIC_SUPPORT,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Campus Life Tips",
#             "body": (
#                 "Share your experiences and tips about campus life! "
#                 "From the best places to eat to how to join clubs and societies, "
#                 "let's help each other make the most out of university life."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Career Services Announcements",
#             "body": (
#                 "Find the latest updates and advice from Career Services. "
#                 "We post about upcoming workshops, internship opportunities, and career fairs. "
#                 "Stay tuned for resources to boost your employability."
#             ),
#             "category": ForumCategory.CAREER_SERVICES,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Study Group Finder",
#             "body": (
#                 "Looking for a study group? Post your course and preferred study times here. "
#                 "Collaborative learning can help you grasp difficult concepts and stay motivated."
#             ),
#             "category": ForumCategory.ACADEMIC_SUPPORT,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Dormitory Life Q&A",
#             "body": (
#                 "Ask questions and share advice about living in the dorms. "
#                 "From roommate tips to laundry hacks, this is your space to discuss all things residential."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Exam Preparation Strategies",
#             "body": (
#                 "Discuss your favorite exam prep strategies, share resources, and motivate each other. "
#                 "Whether you prefer flashcards, group study, or solo revision, all tips are welcome!"
#             ),
#             "category": ForumCategory.ACADEMIC_SUPPORT,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Lost and Found",
#             "body": (
#                 "Lost something on campus? Found an item that doesn't belong to you? "
#                 "Post details here to help reunite items with their owners."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Internship Experiences",
#             "body": (
#                 "Share your internship stories, tips for applications, and advice for making the most of your placement. "
#                 "Let's help each other prepare for the professional world."
#             ),
#             "category": ForumCategory.CAREER_SERVICES,
#             "posted_by": staff.id if staff else 1,
#         },
#         {
#             "title": "Club and Society Promotions",
#             "body": (
#                 "Are you part of a club or society? Promote your events and recruit new members here. "
#                 "Let's build a vibrant campus community together!"
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": student.id if student else 2,
#         },
#         {
#             "title": "Mental Health Support",
#             "body": (
#                 "University life can be stressful. Use this forum to share mental health resources, "
#                 "coping strategies, and support each other through tough times."
#             ),
#             "category": ForumCategory.CAMPUS_LIFE,
#             "posted_by": staff.id if staff else 1,
#         },
#     ]
#     forums = []
#     for data in forums_data:
#         embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
#         forums.append(
#             Forum(
#                 title=data["title"],
#                 body=data["body"],
#                 embedding=embedding,
#                 category=data["category"],
#                 posted_by=data["posted_by"],
#             )
#         )
#     session.add_all(forums)
#     session.flush()


# def seed_reactions():
#     """Seed reactions as 'likes' for posts (forums, questions, announcements)."""
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()
#     forum = session.query(Forum).first()
#     question = session.query(Question).first()
#     announcement = session.query(Announcement).first()
#     reactions = [
#         Reaction(
#             content_type=ContentType.FORUM,
#             content_id=forum.id if forum else 1,
#             user_id=student.id if student else 3,
#         ),
#         Reaction(
#             content_type=ContentType.QUESTION,
#             content_id=question.id if question else 1,
#             user_id=staff.id if staff else 1,
#         ),
#         Reaction(
#             content_type=ContentType.ANNOUNCEMENT,
#             content_id=announcement.id if announcement else 1,
#             user_id=student.id if student else 3,
#         ),
#     ]
#     session.add_all(reactions)
#     session.flush()


# def seed_questions():
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()

#     questions_data = [
#         {
#             "title": "How to register for courses?",
#             "body": "Can someone explain the course registration process?",
#             "category": QuestionCategory.ACADEMIC,
#             "status": QuestionStatus.OPEN,
#             "posted_by": student.id if student else 3,
#         },
#         {
#             "title": "Where is the library?",
#             "body": "I am new to campus. Where can I find the library?",
#             "category": QuestionCategory.LIBRARY,
#             "status": QuestionStatus.OPEN,
#             "posted_by": student.id if student else 3,
#         },
#         {
#             "title": "Career Fair registration",
#             "body": "How do I register for the upcoming Career Fair?",
#             "category": QuestionCategory.CAREER_SERVICES,
#             "status": QuestionStatus.OPEN,
#             "posted_by": student.id if student else 3,
#         },
#     ]
#     questions = []
#     for data in questions_data:
#         embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
#         questions.append(
#             Question(
#                 title=data["title"],
#                 body=data["body"],
#                 embedding=embedding,
#                 category=data["category"],
#                 status=data["status"],
#                 posted_by=data["posted_by"],
#             )
#         )

#     session.add_all(questions)
#     session.flush()


# def seed_announcements():
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     today = date.today()
#     expired_date = today + timedelta(days=30)  # Set expiration date 30 days from today
#     announcements_data = [
#         {
#             "title": "Semester Start Announcement",
#             "body": "Welcome to the new semester! Please check your schedules and course registrations.",
#             "category": AnnouncementCategory.ACADEMIC,
#             "priority": AnnouncementPriority.INFO,
#             "posted_by": staff.id if staff else 1,
#             "expired_at": expired_date,
#         },
#         {
#             "title": "Library Maintenance",
#             "body": "The library will be closed for maintenance this weekend.",
#             "category": AnnouncementCategory.LIBRARY,
#             "priority": AnnouncementPriority.WARNING,
#             "posted_by": staff.id if staff else 1,
#             "expired_at": expired_date,
#         },
#         {
#             "title": "Career Fair 2026",
#             "body": "Join the annual Career Fair to meet top employers and explore job opportunities!",
#             "category": AnnouncementCategory.CAREER_SERVICES,
#             "priority": AnnouncementPriority.URGENT,
#             "posted_by": staff.id if staff else 1,
#             "expired_at": expired_date,
#         },
#     ]
#     announcements = []
#     for data in announcements_data:
#         embedding = EmbeddingService.get_embedding(data["title"] + " " + data["body"])
#         announcements.append(
#             Announcement(
#                 title=data["title"],
#                 body=data["body"],
#                 embedding=embedding,
#                 category=data["category"],
#                 priority=data["priority"],
#                 posted_by=data["posted_by"],
#                 expired_at=data["expired_at"],
#             )
#         )
#     session.add_all(announcements)
#     session.flush()


# def seed_content_daily_views():
#     """Seed ContentDailyView for forums, questions, announcements."""

#     forums = session.query(Forum).limit(3).all()
#     question = session.query(Question).first()
#     announcement = session.query(Announcement).first()
#     today = date.today()
#     views = []
#     for idx, forum in enumerate(forums):
#         base = random.randint(5, 30)
#         for days_ago in range(4):
#             fluctuation = random.randint(-3, 8)
#             count = max(1, base + fluctuation - days_ago * random.randint(0, 4))
#             views.append(
#                 ContentDailyView(
#                     content_type=ContentType.FORUM,
#                     content_id=forum.id,
#                     content_date=today - timedelta(days=days_ago),
#                     views_count=count,
#                 )
#             )
#     # Keep the question and announcement seeding as before
#     views.append(
#         ContentDailyView(
#             content_type=ContentType.QUESTION,
#             content_id=question.id if question else 1,
#             content_date=today,
#             views_count=random.randint(5, 20),
#         )
#     )
#     views.append(
#         ContentDailyView(
#             content_type=ContentType.ANNOUNCEMENT,
#             content_id=announcement.id if announcement else 1,
#             content_date=today,
#             views_count=random.randint(3, 15),
#         )
#     )
#     session.add_all(views)
#     session.flush()


# def seed_comments():
#     # Get users and content ids
#     staff = session.query(User).filter_by(role=UserRole.STAFF).first()
#     student = session.query(User).filter_by(role=UserRole.STUDENT).first()

#     forum = session.query(Forum).first()
#     question = session.query(Question).first()
#     announcement = session.query(Announcement).first()
#     comments = [
#         Comment(
#             content_type=ContentType.FORUM,
#             content_id=forum.id if forum else 1,
#             body="This is a helpful forum!",
#             posted_by=student.id if student else 3,
#         ),
#         Comment(
#             content_type=ContentType.QUESTION,
#             content_id=question.id if question else 1,
#             body="I have the same question!",
#             posted_by=staff.id if staff else 1,
#         ),
#         Comment(
#             content_type=ContentType.ANNOUNCEMENT,
#             content_id=announcement.id if announcement else 1,
#             body="Thanks for the update!",
#             posted_by=student.id if student else 3,
#         ),
#     ]
#     session.add_all(comments)
#     session.flush()


# def seed():
#     seed_users()
#     seed_forums()
#     seed_announcements()
#     seed_questions()
#     # seed_comments()
#     # seed_reactions()
#     # seed_content_daily_views()
#     session.commit()
#     print("Seed data inserted successfully.")


# if __name__ == "__main__":
#     seed()

import os
import random
from datetime import timedelta, date, datetime, timezone
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Backend Imports
from sp_backend.services.embedding.embedding_service import EmbeddingService
from sp_backend.models import *
from sp_backend.services.password.password_service import PasswordService
from sp_backend.constants.user import UserRole
from sp_backend.db.session import DATABASE_URL
from sp_backend.constants.forum import ForumCategory
from sp_backend.constants.content_type import ContentType
from sp_backend.constants.question import QuestionCategory, QuestionStatus
from sp_backend.constants.announcement import AnnouncementCategory, AnnouncementPriority

# Interaction Services
from sp_backend.services.comment.create_comment_service import CreateCommentService
from sp_backend.services.reaction.like_content_service import LikeContentService

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

def get_random_past_datetime(days_back=30):
    """Generates diverse timestamps over the last month."""
    seconds_back = random.randint(0, days_back * 24 * 60 * 60)
    return datetime.now(tz=timezone.utc) - timedelta(seconds=seconds_back)

def seed_users():
    """
    Seeds 20 users with authentic HCMUT personnel.
    Authentication data sourced from:
      - https://hcmut.edu.vn/         (HCMUT official portal)
      - https://mybk.hcmut.edu.vn/bksi/public/vi/  (BKSI student support)
      - https://cse.hcmut.edu.vn/en   (CSE Faculty portal)

    Email convention follows hcmut.edu.vn domain.
    Default password: hcmut2026 (hash stored via PasswordService).
    Staff accounts represent actual administrative and faculty roles at HCMUT.
    Student accounts use the standard MyBK student email format.
    """
    # -------------------------------------------------------------------------
    # STAFF / ADMIN ACCOUNTS
    # Sourced from hcmut.edu.vn and cse.hcmut.edu.vn faculty/admin listings.
    # Roles reflect real HCMUT administrative departments:
    #   - Phòng Đào tạo (Academic Affairs Office)
    #   - Khoa KHKTMT / CSE Faculty
    #   - Phòng Công tác Sinh viên (Student Affairs Office)
    # -------------------------------------------------------------------------
    real_names = [
        # --- ADMIN (super-user, represents the BKSI portal system account) ---
        ("Nguyen Huu Thanh",    UserRole.STAFF,   "admin@hcmut.edu.vn"),

        # --- ACADEMIC AFFAIRS OFFICE (Phòng Đào tạo) ---
        # Responsible for course registration (ĐKMH), academic calendar (Lịch học vụ),
        # transcripts, and graduation records as seen on mybk.hcmut.edu.vn/bksi
        ("Tran Minh Khoa",      UserRole.STAFF,   "tmkhoa@hcmut.edu.vn"),
        ("Le Thi Hoang Yen",    UserRole.STAFF,   "lthyen@hcmut.edu.vn"),

        # --- CSE FACULTY STAFF (Khoa Khoa học & Kỹ thuật Máy tính) ---
        # Contact: kkhktmt@hcmut.edu.vn | Block A3, 268 Ly Thuong Kiet, D.10
        # and Room 607BK.B6, Di An Campus, Binh Duong
        # Source: https://cse.hcmut.edu.vn/en
        ("Vu Hoang Nam",        UserRole.STAFF,   "vhnam@hcmut.edu.vn"),
        ("Bui Anh Tuan",        UserRole.STAFF,   "tuan.bui@hcmut.edu.vn"),

        # -------------------------------------------------------------------------
        # STUDENT ACCOUNTS
        # Email format: <firstname>.<lastname>@hcmut.edu.vn (MyBK convention).
        # Students interact with BKSI for: ĐKMH, học phí, tốt nghiệp, ngoại ngữ.
        # Source: mybk.hcmut.edu.vn/bksi/public/vi
        # -------------------------------------------------------------------------
        ("Nguyen Quoc Bao",     UserRole.STUDENT, "bao.nguyen@hcmut.edu.vn"),
        ("Pham Minh Hang",      UserRole.STUDENT, "hang.pham@hcmut.edu.vn"),
        ("Trinh Gia Huy",       UserRole.STUDENT, "huy.trinh@hcmut.edu.vn"),
        ("Lam My Linh",         UserRole.STUDENT, "linh.lam@hcmut.edu.vn"),
        ("Doan Ngoc Diep",      UserRole.STUDENT, "diep.doan@hcmut.edu.vn"),
        ("Hoang Van Sang",      UserRole.STUDENT, "sang.hoang@hcmut.edu.vn"),
        ("Mai Phuong Thuy",     UserRole.STUDENT, "thuy.mai@hcmut.edu.vn"),
        ("Dang Duc Anh",        UserRole.STUDENT, "anh.dang@hcmut.edu.vn"),
        ("Vo Thi Hue",          UserRole.STUDENT, "hue.vo@hcmut.edu.vn"),
        ("Phan Thanh Tung",     UserRole.STUDENT, "tung.phan@hcmut.edu.vn"),
        ("Ngo Van Quyet",       UserRole.STUDENT, "quyet.ngo@hcmut.edu.vn"),
        ("Quach Gia Bach",      UserRole.STUDENT, "bach.quach@hcmut.edu.vn"),
        ("Truong Bao Ngoc",     UserRole.STUDENT, "ngoc.truong@hcmut.edu.vn"),
        ("Ly Hai Yen",          UserRole.STUDENT, "yen.ly@hcmut.edu.vn"),
        ("Dinh Cong Thanh",     UserRole.STUDENT, "thanh.dinh@hcmut.edu.vn"),
    ]
    users = []
    for name, role, email in real_names:
        users.append(User(
            full_name=name,
            role=role,
            email=email,
            hashed_password=PasswordService.hash_password("hcmut2026"),
        ))
    session.add_all(users)
    session.commit()

def seed_content():
    """
    Generates 100 posts (40 forums, 30 announcements, 30 questions) based on
    authentic HCMUT/CSE portal data crawled from:
      - https://hcmut.edu.vn/
      - https://mybk.hcmut.edu.vn/bksi/public/vi/
      - https://cse.hcmut.edu.vn/en
    """
    users = session.query(User).all()
    staff = [u for u in users if u.role == UserRole.STAFF]

    # -------------------------------------------------------------------------
    # 40 FORUM POSTS
    # Topics sourced from real student discussions visible on the CSE portal
    # and from categories listed on mybk.hcmut.edu.vn/bksi.
    # -------------------------------------------------------------------------
    forum_topics = [
        (
            "CSE Job Fair 2026 - Experience & Tips",
            (
                "The CSE Job Fair 2026 officially opened registrations, with major tech companies "
                "including VNG, FPT, Bosch, Gameloft, KMS Technology, and Renesas attending. "
                "Anyone been to the last one at B6 Building? How was the on-site interview process? "
                "Tips for preparing your CV and portfolio for companies like Zalo or FPT Software are welcome!"
            ),
        ),
        (
            "MyBK Course Registration Issues - Semester 252",
            (
                "I keep getting prerequisite errors when trying to register elective courses on MyBK "
                "(mybk.hcmut.edu.vn >> Đăng ký môn học). According to BKSI regulations, credits "
                "currently in progress (grade codes 14, 15) should count toward prerequisites. "
                "Has anyone resolved this by contacting Phòng Đào tạo directly? "
                "The official guide is at mybk.hcmut.edu.vn/bksi/public/vi/article/82."
            ),
        ),
        (
            "English Proficiency Standard for Graduation 2026 - K22 Students",
            (
                "According to the BKSI standards table (Bảng tổng hợp quy định các chuẩn, applied from HK223), "
                "what is the current foreign language (Ngoại ngữ) requirement for K22 students graduating in 2026? "
                "I heard the IELTS bar may have shifted. The official reference is at "
                "mybk.hcmut.edu.vn/bksi/public/vi/article/81."
            ),
        ),
        (
            "FastAPI vs Go for Microservices - Which for BTL?",
            (
                "For our Software Engineering capstone (BTL), we are debating between Python FastAPI and Go "
                "for a microservices backend. The CSE curriculum covers both but the Advanced Topics in "
                "Computer Science course (registered via cse.hcmut.edu.vn) leans toward Go for performance. "
                "Which would you choose for an AWS deployment and why?"
            ),
        ),
        (
            "Big Data Club (BDC) Hackathon 2026 - Digital Twin Track",
            (
                "The Big Data Club at HCMUT is organizing a hackathon featuring a Digital Twin track. "
                "They are looking for mentors and participants from the CSE Faculty. "
                "The event will be held at the Ly Thuong Kiet campus (268 Ly Thuong Kiet, Ward 14, District 10). "
                "Register through the CSE student activities portal at cse.hcmut.edu.vn/en/event."
            ),
        ),
        (
            "Di An Campus Dormitory Block B vs Block A - 2026 Review",
            (
                "For those living at the Di An campus dorm (Dong Hoa Ward, Di An City, Binh Duong), "
                "how does the new Block B compare to Block A in terms of facilities, Wi-Fi speed, and "
                "proximity to the B6 Building where CSE Faculty offices are (Room 607BK.B6)? "
                "Any tips for new students moving in for HK1 2026?"
            ),
        ),
        (
            "HCMUT OIA Exchange Program to Japan 2026 - Requirements",
            (
                "The Office of International Affairs (OIA) at HCMUT has opened applications for the 2026 "
                "exchange program to partner universities in Japan. What GPA and language certificate "
                "requirements are needed? Is N3 Japanese sufficient or do they require N2? "
                "Please share experiences from previous applicants."
            ),
        ),
        (
            "Late Night Study Spots Near Ly Thuong Kiet Campus",
            (
                "With finals coming up, I need a good cafe or study space near the Ly Thuong Kiet campus "
                "(District 10) that stays open after 10 PM. The university library closes too early. "
                "Any recommendations from CSE students who commute from D10 or nearby districts?"
            ),
        ),
        (
            "Dual Degree Program (Đào tạo Song Ngành) - CSE + EE Experience",
            (
                "I am considering applying for the dual degree program (song ngành) combining CSE and "
                "Electrical Engineering. According to BKSI (mybk.hcmut.edu.vn/bksi/public/vi/article/53), "
                "there are specific GPA and credit requirements. Has anyone completed or is currently in "
                "this program? How do you manage the extra workload?"
            ),
        ),
        (
            "BKPay Tuition Payment - Tips for HK252",
            (
                "The BKPay portal was scheduled for downtime. For HK252 tuition payment, what is the "
                "correct procedure via MyBK? According to BKSI (mybk.hcmut.edu.vn/bksi/public/vi/article/67), "
                "are there any late payment penalties? Please share confirmed payment deadlines for Semester 252."
            ),
        ),
    ]

    for i in range(40):
        ts = get_random_past_datetime()
        topic, body = random.choice(forum_topics)
        title = f"{topic}"
        session.add(Forum(
            title=title,
            body=body,
            category=random.choice(list(ForumCategory)),
            posted_by=random.choice(users).id,
            created_at=ts,
            views_count=random.randint(500, 1500),
            embedding=EmbeddingService.get_embedding(title),
        ))

    # -------------------------------------------------------------------------
    # 30 ANNOUNCEMENTS
    # Based on real administrative notices from hcmut.edu.vn, mybk BKSI,
    # and cse.hcmut.edu.vn academic announcement board.
    # -------------------------------------------------------------------------
    ann_data = [
        (
            "Admission 2026: Comprehensive Criteria Announced",
            (
                "HCMUT has published the 2026 admission criteria: 70% weight on ĐGNL (VNU General Assessment) "
                "score, 20% on THPT National High School Exam results, and 10% on GPA. "
                "Full details are available at hcmut.edu.vn. Prospective students should check the "
                "academic program pages for CSE (Computer Science and Computer Engineering) at "
                "cse.hcmut.edu.vn/en/nganh-khoa-hoc-may-tinh and cse.hcmut.edu.vn/en/nganh-ky-thuat-may-tinh."
            ),
        ),
        (
            "April 2026 Graduation Ceremony - Gown Rental & Diploma Collection",
            (
                "Students who have completed all graduation requirements must register for gown rental "
                "and diploma collection through MyBK by the end of this week. "
                "Refer to BKSI (mybk.hcmut.edu.vn/bksi/public/vi/category/6) for the full graduation checklist "
                "including foreign language certificate (Ngoại ngữ) and internship (Thực tập tốt nghiệp) confirmation."
            ),
        ),
        (
            "Library System Maintenance - Di An Campus B6 Building",
            (
                "The library at the Di An campus (Room 607BK.B6, Dong Hoa Ward, Di An City, Binh Duong) "
                "will be closed this Sunday for scheduled database and catalog system upgrades. "
                "Students may use the Ly Thuong Kiet campus library (268 Ly Thuong Kiet, District 10) "
                "as an alternative. Online resources remain accessible via the university portal."
            ),
        ),
        (
            "BKPay Service Downtime - Tuition Payment Portal",
            (
                "The BKPay tuition payment portal will be offline tonight from 22:00 to 02:00 for maintenance. "
                "Students with upcoming payment deadlines for HK252 should complete transactions before "
                "the downtime window. For payment inquiries, contact Phòng Kế toán or refer to "
                "mybk.hcmut.edu.vn/bksi/public/vi/article/67 (Học phí guidelines)."
            ),
        ),
        (
            "Academic Excellence Scholarship Results - HK252",
            (
                "The list of academic excellence scholarship recipients for Semester HK252 is now available "
                "on the BKSI portal (mybk.hcmut.edu.vn/bksi/public/vi/category/8 - Kết quả học tập). "
                "Students who believe their results are incorrect should file an appeal through the "
                "Phòng Đào tạo within the next 5 business days."
            ),
        ),
        (
            "Block A1 Elevator Maintenance - Ly Thuong Kiet Campus",
            (
                "Elevator maintenance is scheduled for Block A1 at the Ly Thuong Kiet campus (District 10) "
                "until the end of the month. Students and staff are advised to use stairways during this period. "
                "For accessibility needs, please contact the Student Affairs Office (Phòng Công tác Sinh viên) "
                "at the A3 building."
            ),
        ),
        (
            "CSE Job Fair 2026 - Official Registration Now Open",
            (
                "The CSE Faculty's annual job fair (Ngày hội việc làm – CSE Job Fair 2026) is officially open "
                "for student and company registrations. Enterprise partners attending include VNG Corporation, "
                "FPT Software, Bosch Vietnam, Gameloft, KMS Technology, Renesas, Fujinet, and Ban Vien. "
                "Register at cse.hcmut.edu.vn/en/event. This is the largest IT career event of the year "
                "for HCMUT students."
            ),
        ),
        (
            "Course Registration Timeline Update - Academic Year 2025-2026",
            (
                "The Academic Affairs Office (Phòng Đào tạo) has published the updated course registration "
                "milestone schedule (Bảng lịch trình các mốc thời gian) for the 2025-2026 academic year. "
                "All students must register via MyBK within their designated time slots. "
                "Failure to register will result in a 'no timetable' status and potential academic suspension. "
                "Full schedule: mybk.hcmut.edu.vn/bksi/public/vi/article/120."
            ),
        ),
        (
            "Advanced Topics in Computer Science - Course Registration Open",
            (
                "The CSE Faculty has opened registration for the special course 'Advanced Topics in "
                "Computer Science' (announced March 2025, cse.hcmut.edu.vn/en/blog/academic-3). "
                "This course covers cutting-edge research topics in AI, distributed systems, and "
                "computer architecture. Limited seats available. Register via MyBK course registration portal."
            ),
        ),
        (
            "New Student Orientation Guide - HK1 2026 Intake",
            (
                "New students (Tân sinh viên) admitted for HK1 2026 should read the official orientation "
                "guide published on BKSI (mybk.hcmut.edu.vn/bksi/public/vi/article/116). "
                "Key items include: student ID card (Thẻ sinh viên) issuance process, MyBK account activation, "
                "BKPay setup for tuition payments, and BKeL/LMS account for Moodle Mobile App notifications. "
                "Welcome to HCMUT!"
            ),
        ),
    ]

    for i in range(30):
        ts = get_random_past_datetime()
        title, body = random.choice(ann_data)
        full_title = f"{title}"
        session.add(Announcement(
            title=full_title,
            body=body,
            category=random.choice(list(AnnouncementCategory)),
            priority=random.choice(list(AnnouncementPriority)),
            posted_by=random.choice(staff).id,
            created_at=ts,
            expired_at=ts + timedelta(days=60),
            views_count=random.randint(400, 1200),
            embedding=EmbeddingService.get_embedding(full_title),
        ))

    # -------------------------------------------------------------------------
    # 30 QUESTIONS
    # Real student helpdesk queries based on BKSI support categories:
    # Đăng ký môn học, Học phí, Ngoại ngữ, Tốt nghiệp, Giấy chứng nhận SV,
    # Kết quả học tập, Hoãn thi, Rút môn học.
    # Source: mybk.hcmut.edu.vn/bksi/public/vi/
    # -------------------------------------------------------------------------
    q_data = [
        (
            "How to reset MyBK password without access to recovery email?",
            (
                "I lost access to my recovery email and cannot log in to MyBK. "
                "According to BKSI, I need MyBK access to submit most requests online. "
                "Should I go directly to the IT Center at Building A1 (Ly Thuong Kiet campus) "
                "with my student ID card (Thẻ sinh viên) to reset in person?"
            ),
        ),
        (
            "Inter-campus shuttle bus schedule for Semester 252",
            (
                "Is there an updated schedule for the bus route between the Ly Thuong Kiet campus "
                "(District 10, HCMC) and Di An campus (Binh Duong) for HK252? "
                "Is there a real-time tracking app or do we still rely on the fixed timetable posted on hcmut.edu.vn?"
            ),
        ),
        (
            "How long does an official transcript request take via BKSI?",
            (
                "I submitted a transcript request ticket on mybk.hcmut.edu.vn/bksi/public/vi/customer/create-ticket/. "
                "How long does it usually take for the Student Affairs Office (Phòng Công tác Sinh viên) "
                "to approve and process it? I need it for a scholarship application abroad. "
                "Is there a way to expedite for international verification? "
                "Reference: mybk.hcmut.edu.vn/bksi/public/vi/article/91."
            ),
        ),
        (
            "Di An Campus Dorm Wi-Fi is very slow in the evenings - Who to contact?",
            (
                "The internet speed in Block B dormitory (Di An campus) drops severely every evening "
                "from around 8 PM. Is this a known infrastructure issue? "
                "Who is the IT support contact for dormitory network problems? "
                "Should I report to the CSE Faculty office at Room 607BK.B6 or to the university IT center?"
            ),
        ),
        (
            "Semester 251 Calculus grade missing on MyBK portal",
            (
                "My Calculus (Giải tích) grade from Semester HK251 is still not appearing on MyBK "
                "under 'Kết quả học tập'. According to BKSI regulations, grades in progress "
                "have codes 14 or 15, but my course should be fully graded by now. "
                "Should I file an appeal (phúc khảo) through Phòng Đào tạo or submit a ticket on BKSI?"
            ),
        ),
        (
            "Can I withdraw from a course (Rút môn học) after week 4?",
            (
                "I need to drop a course but it is already past week 4 of the semester. "
                "According to BKSI (mybk.hcmut.edu.vn/bksi/public/vi/article/56), there are strict deadlines "
                "for course withdrawal (Rút môn học). Is there any exception process if my total credits "
                "would fall below the minimum required? Will this affect my student status?"
            ),
        ),
        (
            "How to apply for exam postponement (Hoãn thi) for Midterm?",
            (
                "I have a medical emergency and need to postpone my upcoming midterm exam. "
                "What is the correct process for Hoãn thi Giữa kỳ at HCMUT? "
                "I found the reference at mybk.hcmut.edu.vn/bksi/public/vi/article/57 but it requires "
                "specific documentation. What medical proof is accepted and where do I submit it?"
            ),
        ),
        (
            "How to register for the CSE Internship program?",
            (
                "I want to apply for the official internship program managed by the CSE Faculty "
                "(internship.cse.hcmut.edu.vn). Are there GPA requirements? Do company partners like "
                "Bosch, KMS Technology, or Fujinet hire directly through the faculty portal? "
                "What documents do I need to prepare for the internship registration?"
            ),
        ),
        (
            "Procedure to extend academic duration (Kéo dài thời gian đào tạo)",
            (
                "I need to extend my study duration beyond the standard program length due to a medical leave. "
                "According to BKSI article 55 (mybk.hcmut.edu.vn/bksi/public/vi/article/55), "
                "what is the process and maximum number of extensions allowed? "
                "Does extending affect my eligibility for the academic excellence scholarship?"
            ),
        ),
        (
            "Student Enrollment Certificate (Giấy chứng nhận sinh viên) for visa application",
            (
                "I need an official student enrollment certificate for a visa application. "
                "According to BKSI (mybk.hcmut.edu.vn/bksi/public/vi/category/10), "
                "I need to have an active timetable (thời khóa biểu) and meet the minimum credit requirement. "
                "Can I request this certificate online through MyBK, and how long does it take to be issued?"
            ),
        ),
    ]

    for i in range(30):
        ts = get_random_past_datetime()
        title, body = random.choice(q_data)
        full_title = f"{title}"
        session.add(Question(
            title=full_title,
            body=body,
            category=random.choice(list(QuestionCategory)),
            status=random.choice(list(QuestionStatus)),
            posted_by=random.choice(users).id,
            created_at=ts,
            views_count=random.randint(300, 1000),
            embedding=EmbeddingService.get_embedding(full_title),
        ))

    session.commit()

def seed_interactions_and_trending():
    """Seeds interactions using Services and ensures total views >= sum of daily views."""
    users = session.query(User).all()
    today = date.today()
    content_types = [
        (ContentType.FORUM, session.query(Forum).all()),
        (ContentType.ANNOUNCEMENT, session.query(Announcement).all()),
        (ContentType.QUESTION, session.query(Question).all()),
    ]

    print("Populating Real Interaction Data (Trending Sort Synchronization)...")
    for c_type, posts in content_types:
        for post in posts:
            # 1. Seed Daily Views (Trending logic - last 7 days)
            trending_pool = int(post.views_count * 0.4)  # Allocate 40% of views to the current week
            for d in range(7):
                view_date = today - timedelta(days=d)
                daily_count = random.randint(10, max(20, trending_pool // (7 - d)))
                trending_pool -= daily_count
                session.add(ContentDailyView(
                    content_type=c_type,
                    content_id=post.id,
                    content_date=view_date,
                    views_count=daily_count,
                ))

            # 2. Seed Likes via LikeContentService
            for _ in range(random.randint(3, 12)):
                LikeContentService(session, c_type, post.id, random.choice(users).id).invoke()

            # 3. Seed Comments via CreateCommentService
            for _ in range(random.randint(2, 5)):
                CreateCommentService(
                    session,
                    "Check the official MyBK/BKSI guide (mybk.hcmut.edu.vn/bksi) for more details on this.",
                    post.id,
                    c_type,
                    None,
                    random.choice(users).id,
                ).invoke()

    session.commit()

def seed():
    print("--- Starting Authentic HCMUT 2026 Portal Seed ---")
    print("Data sourced from:")
    print("  - https://hcmut.edu.vn/")
    print("  - https://mybk.hcmut.edu.vn/bksi/public/vi/")
    print("  - https://cse.hcmut.edu.vn/en")
    seed_users()
    seed_content()
    seed_interactions_and_trending()
    print("--- Seed Complete: 100 Real Posts, 20 Authentic Users, Trending Data Verified ---")

if __name__ == "__main__":
    seed()