import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import Forums from "./components/Forums";
import Announcements from "./components/Announcements";
import QuestionsArchive from "./components/QuestionsArchive";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "forums", Component: Forums },
      { path: "announcements", Component: Announcements },
      { path: "questions", Component: QuestionsArchive },
      { path: "*", Component: NotFound },
    ],
  },
]);
