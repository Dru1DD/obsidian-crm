import Routing from "@/routing";
import { ToastContainer, Zoom } from "react-toastify";

const RootProvider = () => {
  return (
    <>
      <Routing />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        limit={3}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
    </>
  );
};

export default RootProvider;
