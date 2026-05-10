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

import os
import random
from datetime import timedelta, date, datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Import models and services
from sp_backend.services.embedding.embedding_service import EmbeddingService
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

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

def seed_users():
    """Seeds 20 users representing HCMUT staff and students."""
    users_data = [
        ("Nguyen Huu Thanh", UserRole.STAFF, "admin@hcmut.edu.vn"),
        ("Tran Minh Khoa", UserRole.STAFF, "tmkhoa@hcmut.edu.vn"),
        ("Le Thi Hoang Yen", UserRole.STAFF, "lthyen@hcmut.edu.vn"),
        ("Vu Hoang Nam", UserRole.STAFF, "vhnam@hcmut.edu.vn"),
        ("Bui Anh Tuan", UserRole.STUDENT, "tuan.bui@hcmut.edu.vn"),
        ("Pham Minh Hang", UserRole.STUDENT, "hang.pham@hcmut.edu.vn"),
        ("Nguyen Quoc Bao", UserRole.STUDENT, "bao.nguyen@hcmut.edu.vn"),
        ("Trinh Gia Huy", UserRole.STUDENT, "huy.trinh@hcmut.edu.vn"),
        ("Lam My Linh", UserRole.STUDENT, "linh.lam@hcmut.edu.vn"),
        ("Doan Ngoc Diep", UserRole.STUDENT, "diep.doan@hcmut.edu.vn"),
        ("Hoang Van Sang", UserRole.STUDENT, "sang.hoang@hcmut.edu.vn"),
        ("Mai Phuong Thuy", UserRole.STUDENT, "thuy.mai@hcmut.edu.vn"),
        ("Dang Duc Anh", UserRole.STUDENT, "anh.dang@hcmut.edu.vn"),
        ("Vo Thi Hue", UserRole.STUDENT, "hue.vo@hcmut.edu.vn"),
        ("Phan Thanh Tung", UserRole.STUDENT, "tung.phan@hcmut.edu.vn"),
        ("Ngo Van Quyet", UserRole.STUDENT, "quyet.ngo@hcmut.edu.vn"),
        ("Quach Gia Bach", UserRole.STUDENT, "bach.quach@hcmut.edu.vn"),
        ("Truong Bao Ngoc", UserRole.STUDENT, "ngoc.truong@hcmut.edu.vn"),
        ("Ly Hai Yen", UserRole.STUDENT, "yen.ly@hcmut.edu.vn"),
        ("Dinh Cong Thanh", UserRole.STUDENT, "thanh.dinh@hcmut.edu.vn")
    ]
    users = []
    for name, role, email in users_data:
        users.append(User(
            full_name=name,
            role=role,
            email=email,
            hashed_password=PasswordService.hash_password("hcmut2026")
        ))
    session.add_all(users)
    session.flush()

def seed_forums():
    users = session.query(User).all()
    forum_topics = [
        ("Review of CSE Job Fair 2026", "Did anyone get a callback from VNG or Zalo at B6?", ForumCategory.CAREER_SERVICES),
        ("MyBK Registration Issues Semester 252", "I'm seeing prerequisite errors for backend electives.", ForumCategory.ACADEMIC_SUPPORT),
        ("Best Pho near District 10", "Recommendations for late-night food after lab hours?", ForumCategory.CAMPUS_LIFE),
        ("English Certificate Verification", "How long does Student Affairs take to verify IELTS results?", ForumCategory.STUDENT_AFFAIRS),
        ("Big Data Club Workshops", "Join us for the session on Knowledge Graphs and Neo4j.", ForumCategory.IT_TECHNOLOGY),
        ("Dormitory Life in Di An", "Tips for living in the new block B dorms.", ForumCategory.CAMPUS_LIFE),
        ("IELTS 6.0 Requirement", "Confirming the new language standards for 2026 graduation.", ForumCategory.ACADEMIC_SUPPORT),
        ("Python FastAPI Architecture", "Sharing my experience building microservices.", ForumCategory.IT_TECHNOLOGY),
        ("CV Tips for Tech Internships", "What recruiters at the Job Fair actually look for.", ForumCategory.CAREER_SERVICES),
        ("Campus Life: Joining Clubs", "Is it worth joining BDC in your first year?", ForumCategory.GENERAL),
    ] * 2 
    
    forums = []
    for i, (title, body, cat) in enumerate(forum_topics):
        full_title = f"{title} (#{i+1})"
        embedding = EmbeddingService.get_embedding(full_title + " " + body)
        forums.append(Forum(
            title=full_title,
            body=body,
            embedding=embedding,
            category=cat,
            posted_by=random.choice(users).id
        ))
    session.add_all(forums)
    session.flush()

def seed_announcements():
    staff = session.query(User).filter_by(role=UserRole.STAFF).all()
    today = date.today()
    ann_data = [
        ("Admission Formula 2026", "Official: 70% ĐGNL, 20% Graduation Exam, 10% GPA.", AnnouncementCategory.ACADEMIC, AnnouncementPriority.URGENT),
        ("April 2026 Graduation", "Registration for gown rental is now live on MyBK.", AnnouncementCategory.ACADEMIC, AnnouncementPriority.INFO),
        ("Central Library Maintenance", "Block B6 library closed for system updates this Sunday.", AnnouncementCategory.LIBRARY, AnnouncementPriority.WARNING),
        ("Master Program Open House", "Information session at Ly Thuong Kiet campus.", AnnouncementCategory.EVENTS, AnnouncementPriority.INFO),
        ("BKPay Maintenance Downtime", "Portal offline tonight from 10 PM to 2 AM.", AnnouncementCategory.IT_SERVICES, AnnouncementPriority.WARNING),
        ("CSE Job Fair 2026 Success", "Thank you to our 500+ partners. Photos on the portal.", AnnouncementCategory.CAREER_SERVICES, AnnouncementPriority.INFO),
        ("Excellence Scholarships", "The list for HK252 rewards has been finalized.", AnnouncementCategory.STUDENT_SERVICES, AnnouncementPriority.INFO),
        ("OIA Exchange Call", "Applications for Europe exchanges are now open.", AnnouncementCategory.EVENTS, AnnouncementPriority.INFO),
        ("Facilities Upgrade: Block A1", "New lab equipment installed for CSE students.", AnnouncementCategory.FACILITIES, AnnouncementPriority.INFO),
        ("Fire Safety Drill", "Mandatory drill for all residents this Friday.", AnnouncementCategory.FACILITIES, AnnouncementPriority.WARNING)
    ] * 2
    
    announcements = []
    for i, (title, body, cat, pri) in enumerate(ann_data):
        full_title = f"{title} (Official #{i+1})"
        embedding = EmbeddingService.get_embedding(full_title + " " + body)
        announcements.append(Announcement(
            title=full_title,
            body=body,
            embedding=embedding,
            category=cat,
            priority=pri,
            posted_by=random.choice(staff).id,
            expired_at=today + timedelta(days=30),
        ))
    session.add_all(announcements)
    session.flush()

def seed_questions():
    students = session.query(User).filter_by(role=UserRole.STUDENT).all()
    q_data = [
        ("How to use BKPay?", "My transaction failed twice. Other methods?", QuestionCategory.STUDENT_SERVICES),
        ("Library VPN Setup", "How do I configure the VPN for IEEE access?", QuestionCategory.LIBRARY),
        ("Bus 52 Schedule Info", "Is there a real-time tracking app?", QuestionCategory.TRANSPORTATION),
        ("Dorm Wi-Fi Issues", "The internet in Block B is very slow.", QuestionCategory.HOUSING),
        ("Internship Status Lag", "Portal says accepted, MyBK says pending.", QuestionCategory.CAREER_SERVICES),
        ("Missing Grades on BKSI", "Semester 251 grades for Calculus missing.", QuestionCategory.ACADEMIC),
        ("Late Night Dining", "Food stalls open inside Di An campus after 9 PM?", QuestionCategory.DINING),
        ("MyBK Password Reset", "Forgot recovery email for university account.", QuestionCategory.IT_SERVICES),
        ("Booking Study Rooms", "How to book group rooms in Central Library?", QuestionCategory.LIBRARY),
        ("Part-time Campus Jobs", "Any student assistant openings this semester?", QuestionCategory.CAREER_SERVICES)
    ] * 2
    
    questions = []
    for i, (title, body, cat) in enumerate(q_data):
        full_title = f"{title} (QID:{i+1})"
        embedding = EmbeddingService.get_embedding(full_title + " " + body)
        questions.append(Question(
            title=full_title,
            body=body,
            embedding=embedding,
            category=cat,
            status=QuestionStatus.OPEN,
            posted_by=random.choice(students).id,
        ))
    session.add_all(questions)
    session.flush()

def seed_interactions():
    """Seeds Reactions, Daily Views, and Comments."""
    users = session.query(User).all()
    forums = session.query(Forum).all()
    announcements = session.query(Announcement).all()
    questions = session.query(Question).all()
    today = date.today()

    all_content = [
        (ContentType.FORUM, forums),
        (ContentType.ANNOUNCEMENT, announcements),
        (ContentType.QUESTION, questions)
    ]

    for c_type, content_list in all_content:
        for item in content_list:
            # 1. Seed Reactions (Likes) - 3 to 10 per post
            reactors = random.sample(users, k=random.randint(3, 10))
            for u in reactors:
                session.add(Reaction(
                    content_type=c_type,
                    content_id=item.id,
                    user_id=u.id
                ))

            # 2. Seed Comments - 2 to 3 per post
            for _ in range(random.randint(2, 3)):
                session.add(Comment(
                    content_type=c_type,
                    content_id=item.id,
                    body=random.choice([
                        "Very useful info, thanks!", "I had the same question.", 
                        "Check MyBK for updates.", "Does this apply to K22?",
                        "Let's meet at library to discuss.", "Great event!"
                    ]),
                    posted_by=random.choice(users).id
                ))

            # 3. Seed Daily Views - Last 7 days
            for i in range(7):
                view_date = today - timedelta(days=i)
                session.add(ContentDailyView(
                    content_type=c_type,
                    content_id=item.id,
                    content_date=view_date,
                    views_count=random.randint(10, 100)
                ))

    session.flush()

def seed():
    print("Initiating Live HCMUT Database Seeding (with Interactions)...")
    seed_users()
    seed_forums()
    seed_announcements()
    seed_questions()
    seed_interactions()
    session.commit()
    print("Seed Complete: 20 Users, 60 Posts, ~150 Comments, ~300 Likes, and 420 View Records.")

if __name__ == "__main__":
    seed()