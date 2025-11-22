import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `isOnline`: The boolean status indicating if the user is currently online.
 * - `socketId`: The socket.io connection ID for real-time communication.
 * - `lastSeen`: The last time the user was active on the platform.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    socketId: {
      type: String,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    badges: [
      {
        type: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        earnedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    hasSeenWelcomeMessage: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Number,
      default: 0,
    },
    showStats: {
      type: Boolean,
      default: true,
    },
  },
  { collection: 'User' },
);

export default userSchema;
