import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as any;
  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an error has occured.</p>
      <p>{error.statusText || error.message || ""}</p>
    </div>
  );
}
