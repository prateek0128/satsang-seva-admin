import axios from 'axios';
import Calendar from '@mui/icons-material/CalendarMonthTwoTone';
import People from '@mui/icons-material/PeopleAltTwoTone';
import Event from '@mui/icons-material/EventNoteTwoTone';
import '../Csss/AdminPage.css';
import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { toast } from '../components/Popup';

const AdminPage = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ users: 0, bookings: 0, events: 0 });
  const [notifTitle, setNotifTitle] = useState('');
  const [notifDescription, setNotifDescription] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(url + 'admin/analytics', { headers });
        if (response.data.success) {
          setData({ users: response.data.users, bookings: response.data.bookings, events: response.data.events });
        } else {
          toast(response.data.message || "Error fetching data", 'error');
        }
      } catch (error) {
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          toast(error.response?.data?.message || error.message || "Error fetching data", 'error');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [url]);

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifDescription.trim()) {
      toast('Please fill both Title and Description', 'warning');
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`${url}admin/send-notification`, { title: notifTitle, body: notifDescription }, { headers });
      if (response.data.success) {
        toast('Notification sent successfully!', 'success');
        setNotifTitle('');
        setNotifDescription('');
      } else {
        toast(response.data.message || 'Failed to send notification', 'error');
      }
    } catch (error) {
      toast(error.response?.data?.message || error.message || 'Error sending notification', 'error');
    }
    setSending(false);
  };

  const items = [
    { title: 'No. of Booking', value: data.bookings, description: 'Total bookings made', icons: <Calendar /> },
    { title: 'Total Users', value: data.users, description: 'Total number of users', icons: <People /> },
    { title: 'Events', value: data.events, description: 'Number of events', icons: <Event /> },
  ];

  return (
    <div className='container'>
      {loading && <Loader />}
      <h1>Statistics</h1>
      <div className='admin-page'>
        {items.map((item, index) => (
          <div className='section' key={index}>
            <div className='text'>
              <p className='text-center text-xl fs-4'>{item.title}</p>
              <div className='icon flex items-center justify-evenly'>
                <p>{item.icons}</p>
                <p className='value'>{item.value}</p>
              </div>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className='notification-section mt-4 p-4 rounded shadow'>
        <h2 className='text-center mb-3 text-2xl font-semibold'>Send Notification To All Users</h2>
        <div className='flex flex-col gap-4'>
          <input type='text' placeholder='Notification Title' value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className='p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400' />
          <textarea placeholder='Notification Description' value={notifDescription} onChange={(e) => setNotifDescription(e.target.value)} rows='4' className='p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400' />
          <button onClick={sendNotification} disabled={sending} className={`p-2 rounded text-white ${sending ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
