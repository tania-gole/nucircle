import { useState } from 'react';
import './index.css';
import { NavLink, useLocation } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';

/**
 * The SideBarNav component has a sidebar navigation menu for all the main pages.
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const { user } = useUserContext();
  const [hovered, setHovered] = useState<boolean>(false);
  const location = useLocation();

  const isActiveOption = (path: string) =>
    location.pathname === path ? 'message-option-selected ' : '';

  const isMessagingActive = location.pathname.startsWith('/messaging');

  return (
    <div id='sideBarNav' className='sideBarNav'>
      <NavLink
        to='/home'
        id='menu_questions'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Questions
      </NavLink>
      <NavLink
        to='/tags'
        id='menu_tag'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Tags
      </NavLink>
      <div
        className='messaging-wrapper'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <NavLink
          to='/messaging/direct-message'
          id='menu_messaging'
          className={`menu_button ${isMessagingActive ? 'menu_selected' : ''}`}>
          Messaging
        </NavLink>
        {hovered && (
          <div className='messaging-dropdown'>
            <NavLink
              to='/messaging/direct-message'
              className={`message-option ${isActiveOption('/messaging/direct-message')}`}>
              Direct Messages
            </NavLink>
            <NavLink
              to='/messaging/community-messages'
              className={`message-option ${isActiveOption('/messaging/community-messages')}`}>
              Community Messages
            </NavLink>
            <NavLink to='/messaging' className={`message-option ${isActiveOption('/messaging')}`}>
              Global Messages
            </NavLink>
          </div>
        )}
      </div>
      <NavLink
        to='/users'
        id='menu_users'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Users
      </NavLink>
      <NavLink
        to='/games'
        id='menu_games'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Games
      </NavLink>
      <NavLink
        to='/communities'
        id='menu_communities'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Communities
      </NavLink>
      <NavLink
        to={`/collections/${user.username}`}
        id='menu_collections'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        My Collections
      </NavLink>
    </div>
  );
};

export default SideBarNav;
