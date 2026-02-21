import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a Work Experience request payload.
 */
export interface WorkExperience {
  username: string;
  title: string;
  company: string;
  type: string;
  location: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export type WorkExperienceUpdate = {
  title?: string;
  company?: string;
  type?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
};

/**
 * Represents a Work Experience stored in the database.
 */
export interface DatabaseWorkExperience extends WorkExperience {
  _id: ObjectId;
}

/**
 * Work Experience return type for service calls.
 */
export type WorkExperienceResponse = DatabaseWorkExperience | { error: string };

export interface CreateWorkExperienceRequest extends Request {
  body: WorkExperience;
}

export interface UpdateWorkExperienceRequest extends Request {
  params: { experienceId: string };
  body: WorkExperienceUpdate;
}

export interface DeleteWorkExperienceRequest extends Request {
  params: { experienceId: string };
}

export interface GetWorkExperiencesRequest extends Request {
  params: { username: string };
}

export interface GetWorkExperienceByIdRequest extends Request {
  params: { experienceId: string };
}
