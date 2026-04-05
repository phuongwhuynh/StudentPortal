import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import Forums from "./components/Forums";
import Announcements from "./components/Announcements";
import QuestionsArchive from "./components/QuestionsArchive";
import ForumThreadDetail from "./components/ForumThreadDetail";
import AnnouncementDetail from "./components/AnnouncementDetail";
import QuestionDetail from "./components/QuestionDetail";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "forums", Component: Forums },
      { path: "forums/:id", Component: ForumThreadDetail },
      { path: "announcements", Component: Announcements },
      { path: "announcements/:id", Component: AnnouncementDetail },
      { path: "questions", Component: QuestionsArchive },
      { path: "questions/:id", Component: QuestionDetail },
      { path: "*", Component: NotFound },
    ],
  },
]);
