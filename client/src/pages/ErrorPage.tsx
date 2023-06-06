import { useRouteError } from "react-router-dom";
import "./ErrorPage.css";

export default function ErrorPage() {
  const error = useRouteError() as any;
  return (
    <div className="center-text">
      <h1>Oops!</h1>
      <p>Sorry, an error has occured.</p>
      <p>
        <i>{error.statusText || error.message || ""}</i>
      </p>
    </div>
  );
}
