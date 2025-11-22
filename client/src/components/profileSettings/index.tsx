import * as React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import useProfileSettings from '../../hooks/useProfileSettings';
import Badges from '../main/badges';
import WorkExperienceList from '../main/workExperience';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    badges,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    setEditBioMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleViewCollectionsPage,
    userStats,
    showStats,
    toggleStatsVisibility,
  } = useProfileSettings();

  if (loading) {
    return (
      <div className='profile-settings'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='profile-settings'>
        <div className='profile-card'>
          <h2>No user data found. Make sure the username parameter is correct.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='profile-settings'>
      {/* Left column: general info */}
      <div className='profile-left-column'>
        <div className='profile-card'>
          <h2>Profile</h2>

          {successMessage && <p className='success-message'>{successMessage}</p>}
          {errorMessage && <p className='error-message'>{errorMessage}</p>}
          <h4>General Information</h4>
          <p>
            <strong>Username:</strong> {userData.username}
          </p>

          {/* ---- Biography Section ---- */}
          <div className='bio-section'>
            <strong>Biography:</strong>
            {!editBioMode && (
              <div>
                <Markdown remarkPlugins={[remarkGfm]}>
                  {userData.biography || 'No biography yet.'}
                </Markdown>
                {canEditProfile && (
                  <button
                    className='button button-primary'
                    onClick={() => {
                      setEditBioMode(true);
                      setNewBio(userData.biography || '');
                    }}>
                    Edit
                  </button>
                )}
              </div>
            )}

            {editBioMode && canEditProfile && (
              <div className='bio-edit'>
                <input
                  className='input-text'
                  type='text'
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                />
                <button className='button button-primary' onClick={handleUpdateBiography}>
                  Save
                </button>
                <button className='button button-danger' onClick={() => setEditBioMode(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ---- Stats Section ---- */}
          <div className='stats-section'>
            <h4>User Stats</h4>
            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>
            {/* show/hide section based on toggleStatsVisibility */}
            {(showStats || canEditProfile) && (
              <>
                <p>
                  <strong>Points Earned:</strong> {userData.points || 0}
                </p>
                <p>
                  <strong>Questions:</strong> {userStats?.questionsPosted || 0}
                </p>
                <p>
                  <strong>Answers:</strong> {userStats?.answersPosted || 0}
                </p>
                <p>
                  <strong>Communities:</strong> {userStats?.communitiesJoined || 0}
                </p>

                <p>
                  <strong>Quizzes Won:</strong> {userStats?.quizzesWon || 0} /{' '}
                  {userStats?.quizzesPlayed || 0}
                </p>
              </>
            )}
            {canEditProfile && (
              <button className='button button-primary' onClick={toggleStatsVisibility}>
                {showStats ? 'Unpublish Stats' : 'Publish Stats'}
              </button>
            )}
          </div>

          {/* ---- Badge Section ---- */}
          <button className='button button-primary' onClick={handleViewCollectionsPage}>
            View Collections
          </button>
          {/* ---- Reset Password Section ---- */}
          {canEditProfile && (
            <>
              <h4>Reset Password</h4>
              <input
                className='input-text'
                type={showPassword ? 'text' : 'password'}
                placeholder='New Password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <input
                className='input-text'
                type={showPassword ? 'text' : 'password'}
                placeholder='Confirm New Password'
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
              />
              <div className='password-actions'>
                <button className='button button-secondary' onClick={togglePasswordVisibility}>
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
                <button className='button button-primary' onClick={handleResetPassword}>
                  Reset
                </button>
              </div>
            </>
          )}
          {/* ---- Danger Zone (Delete User) ---- */}
          {canEditProfile && (
            <>
              <h4>Danger Zone</h4>
              <button className='button button-danger' onClick={handleDeleteUser}>
                Delete This User
              </button>
            </>
          )}
          {/* ---- Confirmation Modal for Delete ---- */}
          {showConfirmation && (
            <div className='modal'>
              <div className='modal-content'>
                <p>
                  Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                  action cannot be undone.
                </p>
                <div className='modal-actions'>
                  <button className='button button-danger' onClick={() => pendingAction?.()}>
                    Confirm
                  </button>
                  <button
                    className='button button-secondary'
                    onClick={() => setShowConfirmation(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className='profile-right-column'>
        {/* ---- Work Experience Section ---- */}
        <WorkExperienceList username={userData.username} />

        {/* ---- Badges Section ---- */}
        <h4>Badges</h4>
        <Badges badges={badges} />
      </div>
    </div>
  );
};

export default ProfileSettings;
