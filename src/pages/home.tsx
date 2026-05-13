import { toast } from "react-toastify";
const HomePage = () => {
  const buttonHandler = () => {
    toast("CHUJ", { type: "warning" });
  };
  return (
    <div className="w-full h-full bg-black text-white">
      <button onClick={buttonHandler}>CLICK ME</button>
    </div>
  );
};

export default HomePage;
