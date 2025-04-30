import ChatPage from './components/4.pages/ChatPage';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './global.scss';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<ChatPage />} />
  )
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

