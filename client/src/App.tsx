import { useEffect, useState } from 'react';
import { FakeSOSocket, SafeDatabaseUser } from './types/types';
import { BrowserRouter as Router } from 'react-router-dom';
import { io } from 'socket.io-client';
import FakeStackOverflow from './components/fakestackoverflow';
import api from './services/config';
import useLoginContext from './hooks/useLoginContext';

// ensures that the socket connections work properly in production as well.
const SERVER_URL: string | undefined = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const App = () => {
  const [socket, setSocket] = useState<FakeSOSocket | null>(null);
  const { setUser } = useLoginContext();

  useEffect(() => {
    if (!socket) {
      setSocket(
        io(SERVER_URL, {
          path: '/socket.io',
          withCredentials: true,
        }),
      );
    }

    return () => {
      if (socket !== null) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Restore user session on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api
        .get('/api/user/me')
        .then(response => {
          const user = response.data as SafeDatabaseUser;
          setUser(user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [setUser]);

  return (
    <Router>
      <FakeStackOverflow socket={socket} />
    </Router>
  );
};

export default App;
