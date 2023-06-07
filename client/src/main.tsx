import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.tsx";
import ChatRoom from "./pages/ChatRoom.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import { PeerContextProvider } from "./contexts/peerConnection.context.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "room/:roomId",
    element: <ChatRoom />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PeerContextProvider>
      <RouterProvider router={router} />
    </PeerContextProvider>
  </React.StrictMode>
);
