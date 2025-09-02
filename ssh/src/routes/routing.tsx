import { createBrowserRouter } from "react-router-dom";
import { ROUTING_PATH } from "./path.constants";

import HomePage from "@/pages/Home";
import LandingPage from "@/pages/Landing";
import AtmMapPage from "@/pages/AtmMap";
import VoicephishingPage from "@/pages/Voicephishing";
import ChatbotPage from "@/pages/Chatbot";
import SettingPage from "@/pages/Setting";
import DonationPage from "@/pages/Donation";

export const routers = createBrowserRouter([
  {
    path: "",
    children: [
      {
        path: ROUTING_PATH.home,
        element: <HomePage />,
      },
      {
        path: ROUTING_PATH.landing,
        element: <LandingPage />,
      },
      {
        path: ROUTING_PATH.atmmap,
        element: <AtmMapPage />,
      },
      {
        path: ROUTING_PATH.voicephishing,
        element: <VoicephishingPage />,
      },
      {
        path: ROUTING_PATH.chatbot,
        element: <ChatbotPage />,
      },
      {
        path: ROUTING_PATH.donation,
        element: <DonationPage />,
      },
      {
        path: ROUTING_PATH.setting,
        element: <SettingPage />,
      },
    ],
  },
]);
