import { useNavigate } from "react-router";

const ErrorPage = () => {
  const navigate = useNavigate();

  const navigateButtonClicked = () => {
    navigate("/");
  };

  return (
    <div className="w-full h-full text-white flex flex-col justify-center items-center">
      <h1 className="text-xl">Something went wrong</h1>
      <button
        onClick={navigateButtonClicked}
        className="cursor-pointer border py-2 px-3  flex items-center gap-2 text-white  text-lg mt-4 transition-all duration-400 hover:bg-white hover:text-black"
      >
        Go to Home Page
      </button>
    </div>
  );
};

export default ErrorPage;
