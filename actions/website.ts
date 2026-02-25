/**
 * @file actions/website.ts
 * @description Server actions for managing website records.
 * Provides functions for creating, updating, toggling tracking, and deleting websites.
 * All actions are protected by authentication checks.
 */

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * createWebsite
 * @description Registers a new website for the authenticated user to track.
 * @param {Object} formData - Details for the new website.
 * @param {string} formData.name - Display name for the website.
 * @param {string} formData.domain - The actual domain URL.
 * @param {boolean} formData.trackLocalhost - Whether to record visits from localhost.
 * @returns {Promise<Object>} The created website record.
 */
export async function createWebsite(formData: {
  name: string;
  domain: string;
  trackLocalhost: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const website = await prisma.website.create({
    data: {
      name: formData.name,
      domain: formData.domain,
      trackLocalhost: formData.trackLocalhost,
      ownerId: session.user.id,
    },
  });

  // Refresh the UI cache for pages that display the website list
  revalidatePath("/dashboard");
  revalidatePath("/websites");

  return website;
}

/**
 * toggleLocalhost
 * @description Fast-toggle for enabling/disabling tracking on local development environments.
 * @param {string} id - The website ID.
 * @param {boolean} enabled - The new state of the toggle.
 */
export async function toggleLocalhost(id: string, enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.website.update({
    where: {
      id,
      ownerId: session.user.id,
    },
    data: { trackLocalhost: enabled },
  });

  revalidatePath("/dashboard");
}

/**
 * updateWebsite
 * @description Modifies existing website configuration.
 * @param {string} id - The website ID to update.
 * @param {Object} data - The updated fields.
 * @returns {Promise<Object>} The updated website record.
 */
export async function updateWebsite(
  id: string,
  data: { name?: string; domain?: string; trackLocalhost?: boolean }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const website = await prisma.website.update({
    where: {
      id,
      ownerId: session.user.id,
    },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/websites/${id}`);

  return website;
}

/**
 * deleteWebsite
 * @description Permanently removes a website and all its associated tracking data.
 * @param {string} id - The website ID to delete.
 */
export async function deleteWebsite(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.website.delete({
    where: {
      id,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
}
