import { FC } from 'react';
import './index.css';
import useNotifications from '../../hooks/useNotifications';

const Notifications: FC = () => {
  const { notifications } = useNotifications();

  return (
    <div className='notifications-wrapper'>
      {notifications.map(n => (
        <div key={n.id} className='notification-card'>
          <strong>{n.type === 'dm' ? `${n.from} sent a DM` : 'Notification'}</strong>
          <p>{n.messagePreview}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
