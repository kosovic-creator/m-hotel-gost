-- CreateTable
CREATE TABLE "Korisnik" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "ime" TEXT,
    "lozinka" TEXT,
    "uloga" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "Korisnik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Soba" (
    "id" SERIAL NOT NULL,
    "broj" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "opis" TEXT NOT NULL,
    "kapacitet" INTEGER NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "slike" TEXT[],
    "tip_en" TEXT NOT NULL,
    "opis_en" TEXT NOT NULL,

    CONSTRAINT "Soba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gost" (
    "id" SERIAL NOT NULL,
    "titula" TEXT NOT NULL DEFAULT 'N/A',
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "titula_drugog_gosta" TEXT,
    "ime_drugog_gosta" TEXT,
    "prezime_drugog_gosta" TEXT,
    "adresa" TEXT,
    "grad" TEXT,
    "drzava" TEXT NOT NULL DEFAULT 'N/A',
    "email" TEXT NOT NULL,
    "telefon" TEXT,

    CONSTRAINT "Gost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rezervacija" (
    "id" SERIAL NOT NULL,
    "sobaBroj" TEXT NOT NULL,
    "gostId" INTEGER NOT NULL,
    "prijava" TIMESTAMP(3) NOT NULL,
    "odjava" TIMESTAMP(3) NOT NULL,
    "broj_osoba" INTEGER NOT NULL DEFAULT 1,
    "popust" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "kreirano" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azurirano" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rezervacija_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_email_key" ON "Korisnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Soba_broj_key" ON "Soba"("broj");

-- CreateIndex
CREATE UNIQUE INDEX "Gost_email_key" ON "Gost"("email");

-- AddForeignKey
ALTER TABLE "Rezervacija" ADD CONSTRAINT "Rezervacija_sobaBroj_fkey" FOREIGN KEY ("sobaBroj") REFERENCES "Soba"("broj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervacija" ADD CONSTRAINT "Rezervacija_gostId_fkey" FOREIGN KEY ("gostId") REFERENCES "Gost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
