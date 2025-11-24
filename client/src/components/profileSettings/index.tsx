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
    editProfileMode,
    setEditProfileMode,
    newMajor,
    setNewMajor,
    newGradYear,
    setNewGradYear,
    handleUpdateProfile,
    showStats,
    toggleStatsVisibility,
    editLinksMode,
    setEditLinksMode,
    newLinkedIn,
    setNewLinkedIn,
    newGithub,
    setNewGithub,
    newPortfolio,
    setNewPortfolio,
    handleUpdateExternalLinks,
    linkValidationError,
    setLinkValidationError,
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
      <div className='profile-left-column'>
        <div className='profile-card'>
          <h2>
            {userData.firstName} {userData.lastName}
          </h2>

          {successMessage && <p className='success-message'>{successMessage}</p>}
          {errorMessage && <p className='error-message'>{errorMessage}</p>}

          <h4>General Information</h4>
          <p>
            <strong>Username:</strong> {userData.username}
          </p>

          <div className='profile-info-section'>
            {!editProfileMode && (
              <div>
                <p>
                  <strong>Major:</strong> {userData.major || 'Not specified'}
                </p>
                <p>
                  <strong>Graduation Year:</strong> {userData.graduationYear || 'Not specified'}
                </p>
                {canEditProfile && (
                  <button
                    className='button button-primary'
                    onClick={() => {
                      setEditProfileMode(true);
                      setNewMajor(userData.major || '');
                      setNewGradYear(userData.graduationYear || '');
                    }}>
                    Edit Profile Info
                  </button>
                )}
              </div>
            )}

            {editProfileMode && canEditProfile && (
              <div className='profile-edit'>
                <label>
                  <strong>Major:</strong>
                  <input
                    className='input-text'
                    type='text'
                    value={newMajor}
                    onChange={e => setNewMajor(e.target.value)}
                    placeholder='Enter your major'
                  />
                </label>
                <label>
                  <strong>Graduation Year:</strong>
                  <input
                    className='input-text'
                    type='number'
                    value={newGradYear}
                    onChange={e => setNewGradYear(e.target.value)}
                    placeholder='Enter graduation year'
                    min='2020'
                    max='2035'
                  />
                </label>
                <button className='button button-primary' onClick={handleUpdateProfile}>
                  Save
                </button>
                <button className='button button-danger' onClick={() => setEditProfileMode(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>

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

          <div className='external-links-section'>
            <h4>External Links</h4>
            {!editLinksMode && (
              <div>
                {userData.externalLinks?.linkedin && (
                  <p>
                    <strong>LinkedIn:</strong>{' '}
                    <a
                      href={userData.externalLinks.linkedin}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {userData.externalLinks.linkedin}
                    </a>
                  </p>
                )}
                {userData.externalLinks?.github && (
                  <p>
                    <strong>GitHub:</strong>{' '}
                    <a
                      href={userData.externalLinks.github}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {userData.externalLinks.github}
                    </a>
                  </p>
                )}
                {userData.externalLinks?.portfolio && (
                  <p>
                    <strong>Portfolio:</strong>{' '}
                    <a
                      href={userData.externalLinks.portfolio}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {userData.externalLinks.portfolio}
                    </a>
                  </p>
                )}
                {!userData.externalLinks?.linkedin &&
                  !userData.externalLinks?.github &&
                  !userData.externalLinks?.portfolio && <p>No external links added yet.</p>}
                {canEditProfile && (
                  <button
                    className='button button-primary'
                    onClick={() => {
                      setEditLinksMode(true);
                      setNewLinkedIn(userData.externalLinks?.linkedin || '');
                      setNewGithub(userData.externalLinks?.github || '');
                      setNewPortfolio(userData.externalLinks?.portfolio || '');
                    }}>
                    {userData.externalLinks?.linkedin ||
                    userData.externalLinks?.github ||
                    userData.externalLinks?.portfolio
                      ? 'Edit Links'
                      : 'Add Links'}
                  </button>
                )}
              </div>
            )}

            {editLinksMode && canEditProfile && (
              <div className='links-edit'>
                {linkValidationError && (
                  <p className='error-message link-error-message'>{linkValidationError}</p>
                )}
                <label>
                  <strong>LinkedIn:</strong>
                  <input
                    className='input-text'
                    type='url'
                    value={newLinkedIn}
                    onChange={e => {
                      setNewLinkedIn(e.target.value);
                      setLinkValidationError(null);
                    }}
                    placeholder='https://linkedin.com/in/yourprofile'
                  />
                </label>
                <label>
                  <strong>GitHub:</strong>
                  <input
                    className='input-text'
                    type='url'
                    value={newGithub}
                    onChange={e => {
                      setNewGithub(e.target.value);
                      setLinkValidationError(null);
                    }}
                    placeholder='https://github.com/yourusername'
                  />
                </label>
                <label>
                  <strong>Portfolio:</strong>
                  <input
                    className='input-text'
                    type='url'
                    value={newPortfolio}
                    onChange={e => {
                      setNewPortfolio(e.target.value);
                      setLinkValidationError(null);
                    }}
                    placeholder='https://yourportfolio.com'
                  />
                </label>
                <button className='button button-primary' onClick={handleUpdateExternalLinks}>
                  Save
                </button>
                <button
                  className='button button-danger'
                  onClick={() => {
                    setEditLinksMode(false);
                    setLinkValidationError(null);
                  }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className='stats-section'>
            <h4>User Stats</h4>
            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>
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

          <button className='button button-primary' onClick={handleViewCollectionsPage}>
            View Collections
          </button>

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

          {canEditProfile && (
            <>
              <h4>Danger Zone</h4>
              <button className='button button-danger' onClick={handleDeleteUser}>
                Delete This User
              </button>
            </>
          )}

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

      <div className='profile-right-column'>
        <WorkExperienceList username={userData.username} />

        <h4>Badges</h4>
        <Badges badges={badges} />
      </div>
    </div>
  );
};

export default ProfileSettings;
