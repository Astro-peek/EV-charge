import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Download } from 'lucide-react';
import api from '../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const orderId = searchParams.get('order_id');
        const signature = searchParams.get('signature');

        if (!paymentId || !orderId) {
          navigate('/');
          return;
        }

        // Verify payment with backend
        const response = await api.post('/payments/verify', {
          paymentId,
          orderId,
          signature
        });

        setBookingDetails(response.data.booking);
      } catch (error) {
        console.error('Payment verification failed:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const handleDownloadInvoice = () => {
    if (bookingDetails?.id) {
      window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/invoices/${bookingDetails.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Your EV charging slot has been booked successfully.
          </p>

          {/* Booking Details */}
          {bookingDetails && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{bookingDetails.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Station:</span>
                  <span className="font-medium">{bookingDetails.station?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(bookingDetails.startTime).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{bookingDetails.duration || '2 hours'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">₹{bookingDetails.amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Home size={20} />
              View Dashboard
            </button>
            
            {bookingDetails && (
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Download size={20} />
                Download Invoice
              </button>
            )}
          </div>

          {/* Important Note */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please arrive at the charging station 5 minutes before your scheduled time. 
              Show your booking ID at the station.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
