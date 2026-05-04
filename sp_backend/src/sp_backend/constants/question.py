from enum import Enum


class QuestionCategory(str, Enum):
    IT_SERVICES = "IT Services"
    LIBRARY = "Library"
    HOUSING = "Housing"
    CAREER_SERVICES = "Career Services"
    ACADEMIC = "Academic"
    DINING = "Dining"
    STUDENT_SERVICES = "Student Services"
    TRANSPORTATION = "Transportation"


class QuestionStatus(str, Enum):
    OPEN = "Open"
    COMPLETED = "Completed"
    CANCELED = "Canceled"
