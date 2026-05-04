from enum import Enum


class ForumCategory(str, Enum):
    ACADEMIC_SUPPORT = "Academic Support"
    CAMPUS_LIFE = "Campus Life"
    CAREER_SERVICES = "Career Services"
    IT_TECHNOLOGY = "IT & Technology"
    STUDENT_AFFAIRS = "Student Affairs"
    GENERAL = "General"
