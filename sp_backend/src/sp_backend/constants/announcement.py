from enum import Enum


class AnnouncementCategory(str, Enum):
    ACADEMIC = "Academic"
    IT_SERVICES = "IT Services"
    EVENTS = "Events"
    LIBRARY = "Library"
    STUDENT_SERVICES = "Student Services"
    FACILITIES = "Facilities"
    CAREER_SERVICES = "Career Services"


class AnnouncementPriority(str, Enum):
    INFO = "Info"
    WARNING = "Warning"
    URGENT = "Urgent"


class SortOptions(str, Enum):
    TRENDING = "trending"
    RECENT = "recent"
    RELEVANT = "relevant"
