import { FiLogOut } from "react-icons/fi";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import DialogBox from "./DialogBox";

export default function LogoutDialog({ logout }) {
  const navigate = useNavigate();
  const dialogTriggerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <li>
      <DialogBox
        title="Are you sure?"
        text="You will be logged out."
        confirmText="Yes, log out!"
        onConfirm={handleLogout}
        afterConfirmText="Logout successfully!"
        triggerRef={dialogTriggerRef}
      />

      <button
        onClick={() => dialogTriggerRef.current?.click()}
        className="flex items-center gap-3 p-3 rounded-lg text-lg font-medium transition-all duration-300
                 hover:bg-blue-800 hover:text-white dark:hover:bg-blue-400 w-full text-left"
      >
        <FiLogOut />
        <span>Logout</span>
      </button>
    </li>
  );
}
