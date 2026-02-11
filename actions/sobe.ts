/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from '@/lib/prisma';


export const ucitajSobe = async () => {
  try {
    const soba = await prisma.soba.findMany();
    return soba;
  } catch (error) {
    console.error("Greška pri učitavanju soba:", error);
    return null;
  }
}
export const ucitajSobuId = async (searchParams: { sobaId: number }) => {
  try {
    const soba = await prisma.soba.findUnique({
      where: { id: searchParams.sobaId },
    });
    return soba;
  } catch (error) {
    console.error("Greška pri učitavanju sobe:", error);
    return null;
  }
};
