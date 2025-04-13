import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      // Call payment API
      await axios.post(`/api/payments/process`, {
        orderId: state.orderId,
        amount: state.amount
      });
      
      // Update order status
      await axios.patch(`/api/orders/${state.orderId}`, {
        paymentStatus: 'Completed'
      });

      navigate(`/confirmation/${state.orderId}`);
    } catch (error) {
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Amount: LKR {state.amount}</h2>
      <button 
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Confirm Payment'}
      </button>
    </div>
  );
}