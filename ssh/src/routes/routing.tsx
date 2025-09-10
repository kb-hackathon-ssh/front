import { createBrowserRouter } from 'react-router-dom';
import { ROUTING_PATH } from './path.constants';

import HomePage from '@/pages/Home/HomePage';
import LoginPage from '@/pages/Login';
import SignUpPage from '@/pages/SignUp';
import AtmMapPage from '@/pages/AtmMap';
import VoicephishingPage from '@/pages/Voicephishing';
import ChatbotPage from '@/pages/Chatbot';
import SettingPage from '@/pages/Setting';
import DonationPage from '@/pages/Donation/DonationPage';
import RootLayout from '@/components/Layout/RootLayout';

import RegisterPage from '@/pages/Donation/sections/Features/Register/RegisterPage';
import BankLinkPage from '@/pages/Donation/sections/Features/Register/BankLinkPage';
import ProtectedRoute from '@/auth/ProtectedRoute';

export const routers = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: ROUTING_PATH.home, element: <HomePage /> },
      { path: ROUTING_PATH.login, element: <LoginPage /> },
      { path: ROUTING_PATH.signup, element: <SignUpPage /> },
      { path: ROUTING_PATH.atmmap, element: <AtmMapPage /> },
      { path: ROUTING_PATH.voicephishing, element: <VoicephishingPage /> },
      { path: ROUTING_PATH.donation, element: <DonationPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTING_PATH.setting, element: <SettingPage /> },
          { path: `${ROUTING_PATH.donation}/register`, element: <RegisterPage /> },
          { path: `${ROUTING_PATH.donation}/banks`, element: <BankLinkPage /> },
        ],
      },
    ],
  },
  { path: ROUTING_PATH.chatbot, element: <ChatbotPage /> },
]);
