"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function createWebsite(formData: { name: string; domain: string; trackLocalhost: boolean }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const website = await prisma.website.create({
    data: {
      name: formData.name,
      domain: formData.domain,
      trackLocalhost: formData.trackLocalhost,
      ownerId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/websites") // In case we have a websites list page
  
  return website
}

export async function toggleLocalhost(id: string, enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.website.update({
    where: { 
        id,
        ownerId: session.user.id
    },
    data: { trackLocalhost: enabled },
  })

  revalidatePath("/dashboard")
}

export async function updateWebsite(id: string, data: { name?: string; domain?: string; trackLocalhost?: boolean }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const website = await prisma.website.update({
    where: { 
        id,
        ownerId: session.user.id
    },
    data,
  })

  revalidatePath("/dashboard")
  revalidatePath(`/websites/${id}`)
  
  return website
}

export async function deleteWebsite(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.website.delete({
    where: {
      id,
      ownerId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
}
