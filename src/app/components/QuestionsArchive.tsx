import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  HelpCircle, 
  Search, 
  ThumbsUp, 
  MessageSquare,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export default function QuestionsArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const questions = [
    {
      id: 1,
      question: "How do I reset my university account password?",
      answer: "To reset your university account password: 1) Go to the IT Services portal at portal.university.edu, 2) Click on 'Forgot Password', 3) Enter your student ID and registered email, 4) Follow the instructions sent to your email. If you encounter issues, contact IT Help Desk at extension 5555.",
      category: "IT Services",
      askedBy: "Multiple Students",
      answeredBy: "IT Help Desk",
      upvotes: 145,
      views: 2340,
      replies: 8,
      dateAsked: "Jan 15, 2025",
      dateAnswered: "Jan 15, 2025",
      tags: ["password", "account", "login"],
      isSolved: true,
      isPopular: true,
    },
    {
      id: 2,
      question: "What are the library hours during exam season?",
      answer: "During examination periods, the University Library operates on extended hours: Monday-Thursday: 7:00 AM - 2:00 AM, Friday: 7:00 AM - 10:00 PM, Saturday: 9:00 AM - 10:00 PM, Sunday: 10:00 AM - 2:00 AM. During finals week, the library is open 24/7. Group study rooms can be booked online up to 7 days in advance.",
      category: "Library",
      askedBy: "Sarah M.",
      answeredBy: "Library Staff",
      upvotes: 98,
      views: 1876,
      replies: 12,
      dateAsked: "Dec 10, 2024",
      dateAnswered: "Dec 10, 2024",
      tags: ["library", "hours", "exams"],
      isSolved: true,
      isPopular: true,
    },
    {
      id: 3,
      question: "How do I apply for on-campus housing?",
      answer: "To apply for on-campus housing: 1) Log into the Student Portal, 2) Navigate to 'Residential Life' section, 3) Complete the housing application form, 4) Pay the $200 housing deposit, 5) Submit your roommate preferences (if any). Priority is given to applications received before April 1st. You'll receive your housing assignment by July 1st.",
      category: "Housing",
      askedBy: "David K.",
      answeredBy: "Residential Life Office",
      upvotes: 87,
      views: 1654,
      replies: 15,
      dateAsked: "Nov 20, 2024",
      dateAnswered: "Nov 20, 2024",
      tags: ["housing", "dormitory", "application"],
      isSolved: true,
      isPopular: false,
    },
    {
      id: 4,
      question: "Where can I find information about internship opportunities?",
      answer: "The Career Services Center offers comprehensive internship resources: 1) Visit the Career Portal at careers.university.edu, 2) Attend career fairs held each semester, 3) Schedule a one-on-one appointment with a career advisor, 4) Join the 'Internship Hub' on the student portal for exclusive postings, 5) Participate in industry-specific workshops. The center also offers resume reviews and interview preparation.",
      category: "Career Services",
      askedBy: "Emily R.",
      answeredBy: "Career Advisor",
      upvotes: 134,
      views: 2890,
      replies: 22,
      dateAsked: "Oct 5, 2024",
      dateAnswered: "Oct 6, 2024",
      tags: ["internship", "career", "jobs"],
      isSolved: true,
      isPopular: true,
    },
    {
      id: 5,
      question: "How do I add or drop a course after the deadline?",
      answer: "Late course changes require special permission: 1) Obtain a Late Add/Drop form from the Registrar's Office or download it from the student portal, 2) Get signatures from your academic advisor and the course instructor, 3) If after the refund deadline, also get approval from your Dean's office, 4) Submit the completed form to the Registrar's Office. Note: Late drops may result in a 'W' grade on your transcript.",
      category: "Academic",
      askedBy: "Michael T.",
      answeredBy: "Registrar's Office",
      upvotes: 76,
      views: 1432,
      replies: 9,
      dateAsked: "Sep 12, 2024",
      dateAnswered: "Sep 12, 2024",
      tags: ["registration", "courses", "add-drop"],
      isSolved: true,
      isPopular: false,
    },
    {
      id: 6,
      question: "What meal plan options are available for students?",
      answer: "The university offers several meal plan options: 1) Unlimited Plan: Unlimited access to dining halls ($2,800/semester), 2) 14 Meals/Week: 14 meals plus $200 dining dollars ($2,400/semester), 3) 10 Meals/Week: 10 meals plus $400 dining dollars ($2,000/semester), 4) Commuter Plan: 5 meals/week plus $300 dining dollars ($900/semester). All plans include access to all dining locations. You can change plans during the first two weeks of each semester.",
      category: "Dining",
      askedBy: "Priya S.",
      answeredBy: "Dining Services",
      upvotes: 112,
      views: 2156,
      replies: 18,
      dateAsked: "Aug 28, 2024",
      dateAnswered: "Aug 28, 2024",
      tags: ["meal-plan", "dining", "food"],
      isSolved: true,
      isPopular: true,
    },
    {
      id: 7,
      question: "How do I request academic accommodations for disabilities?",
      answer: "To request academic accommodations: 1) Register with the Office of Disability Services (ODS), 2) Submit documentation of your disability from a qualified professional, 3) Schedule an intake appointment with an ODS coordinator, 4) Discuss appropriate accommodations based on your needs, 5) ODS will provide accommodation letters to share with your instructors. Contact ODS at disability@university.edu or visit Room 120, Student Center.",
      category: "Student Services",
      askedBy: "James L.",
      answeredBy: "Disability Services",
      upvotes: 65,
      views: 987,
      replies: 6,
      dateAsked: "Aug 15, 2024",
      dateAnswered: "Aug 15, 2024",
      tags: ["accommodations", "disability", "accessibility"],
      isSolved: true,
      isPopular: false,
    },
    {
      id: 8,
      question: "What are the parking permit options and costs?",
      answer: "Parking permit options for 2025-2026: 1) Annual Commuter Permit: $450 (Lots A-D), 2) Semester Commuter Permit: $250 (Lots A-D), 3) Annual Reserved Permit: $850 (Assigned space in Lot E), 4) Evening/Weekend Only: $150/semester (after 5 PM and weekends). Purchase permits online through the Transportation Services portal. Limited permits available - register early! Violations result in fines starting at $25.",
      category: "Transportation",
      askedBy: "Alex W.",
      answeredBy: "Transportation Services",
      upvotes: 94,
      views: 1765,
      replies: 14,
      dateAsked: "Jul 30, 2024",
      dateAnswered: "Jul 31, 2024",
      tags: ["parking", "permits", "transportation"],
      isSolved: true,
      isPopular: true,
    },
  ];

  const categories = ["all", "IT Services", "Library", "Housing", "Career Services", "Academic", "Dining", "Student Services", "Transportation"];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const popularQuestions = questions.filter(q => q.isPopular);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Questions Archive</h1>
        <p className="text-gray-600">
          Browse through thousands of answered questions from the university community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solved</p>
                <p className="text-2xl font-bold">
                  {questions.filter(q => q.isSolved).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">
                  {(questions.reduce((sum, q) => sum + q.views, 0) / 1000).toFixed(1)}k
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search questions, answers, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Popular Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Most Popular Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularQuestions.slice(0, 3).map((q) => (
              <button
                key={q.id}
                onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                className="w-full text-left p-4 rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-2">{q.question}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {q.upvotes}
                      </span>
                      <span>{q.views} views</span>
                      <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                    </div>
                  </div>
                  {expandedQuestion === q.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </div>
                {expandedQuestion === q.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">{q.answer}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Questions ({filteredQuestions.length})</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {filteredQuestions.map((q) => (
            <AccordionItem key={q.id} value={`item-${q.id}`} className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="hover:no-underline px-6">
                  <div className="flex items-start gap-4 text-left flex-1 pr-4">
                    <div className="hidden sm:flex flex-col items-center gap-1 pt-1">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2">{q.question}</h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {q.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <Badge variant="secondary" className="text-xs">
                          {q.category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {q.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {q.replies}
                        </span>
                        <span>{q.views} views</span>
                        <span className="text-gray-400">•</span>
                        <span>Asked {q.dateAsked}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="pl-0 sm:pl-14">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-green-900 mb-1">Accepted Answer</p>
                          <p className="text-sm text-gray-700">{q.answer}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Answered by {q.answeredBy} on {q.dateAnswered}</span>
                      <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                        View Full Thread →
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions found matching your search criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or browse all categories.</p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-8 text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Didn't find what you're looking for?</h3>
          <p className="text-gray-600 mb-4">Ask a new question in the forums and get help from the community</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask a Question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
