import Swal from "sweetalert2";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      text: "You will be redirected to the homepage shortly.",
      showConfirmButton: false,
      timer: 3000,
    });

    const timer = setTimeout(() => {
      navigate("/user-dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return null;
};

export default PaymentSuccess;
