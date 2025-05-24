import { Role } from "@prisma/client";

/**
 * Represents an LDAP user entry.
 * @interface MyUser
 * @property {string} dn - The Distinguished Name of the user.
 * @property {string} uidNumber - The user ID number of the user.
 * @property {string} cn - The common name (full name) of the user.
 * @property {string} mail - The email address of the user.
 * @property {string} gidNumber - The group ID number of the user.
 */
export interface MyUser {
   dn: string;
  uidNumber: string;
  cn: string;
  mail: string;
  gidNumber: string;
}


/**
 * Represents a user object containing various user-related attributes.
 *
 * @interface user
 * @property {number} id - The unique identifier for the user.
 * @property {string | null} name - The full name of the user, or null if not available.
 * @property {string | null} employeeEmail - The email address of the user, or null if not available.
 * @property {string | null} employeeCenter - The center or location associated with the user, or null if not available.
 * @property {Role} role - The role of the user.
 * @property {string | null} employeeGroup - The group that the user belongs to, or null if not available.
 */
export interface user {
  id: number;
  name: string | null;
  employeeEmail: string | null;
  employeeCenter: string | null;
  role: Role;
  employeeGroup: string | null;
}

