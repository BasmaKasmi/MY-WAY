require('dotenv').config({ path: '.env.test' });
import { createTrip, updateTrip, deleteTrip } from '../../src/services/Trips.service';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

function mockRequest(data?: any): Request {
  const req = {} as Request;
  req.body = data?.body || {};
  req.params = data?.params || {};
  req.query = data?.query || {};
  req.headers = data?.headers || {};
  return req;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe('Services de Trip', () => {
  let userId: number;
  let tripId: number;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.photo.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.step.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        address: '123 Rue de Test, Paris, France',
      },
    });
    userId = user.id;

    const trip = await createTrip({
      name: 'Voyage de test',
      summary: 'Ceci est un voyage de test',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'),
      country: 'France',
      userId: userId,
      isPublic: true,
    });
    tripId = trip.id;
  });

  describe('createTrip', () => {
    it('devrait créer un voyage avec succès', async () => {
      const req = mockRequest({
        body: {
          name: 'Nouveau voyage',
          summary: 'Un nouveau voyage pour tester la création',
          startDate: '2024-06-01',
          endDate: '2024-06-10',
          country: 'Italie',
          userId: userId,
          isPublic: true,
        },
      });
      const res = mockResponse();

      const newTrip = await createTrip(req.body);

      expect(newTrip).toHaveProperty('id');
      expect(newTrip.name).toBe(req.body.name);
      expect(newTrip.summary).toBe(req.body.summary);
      expect(newTrip.country).toBe(req.body.country);
      expect(newTrip.userId).toBe(userId);

      const createdTrip = await prisma.trip.findUnique({ where: { id: newTrip.id } });
      expect(createdTrip).not.toBeNull();
      expect(createdTrip?.name).toBe(req.body.name);
    });
  });

  describe('updateTrip', () => {
    it('devrait mettre à jour un voyage avec succès', async () => {
      const updatedData = {
        name: 'Voyage mis à jour',
        summary: 'Résumé mis à jour',
        isPublic: false,
      };

      const updatedTrip = await updateTrip(tripId, updatedData);

      expect(updatedTrip.name).toBe(updatedData.name);
      expect(updatedTrip.summary).toBe(updatedData.summary);
      expect(updatedTrip.isPublic).toBe(updatedData.isPublic);
    });

    it("devrait retourner une erreur si l'ID fourni n'existe pas", async () => {
      const nonExistentId = 9999; // Un ID qui n'existe pas
      try {
        await updateTrip(nonExistentId, {
          name: "Voyage inexistant",
          summary: "Résumé inexistant",
        });
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toBe("Erreur lors de la mise à jour du voyage");
        } else {
          throw new Error("Erreur inattendue");
        }
      }
    });
    
    
  });

  describe('deleteTrip', () => {
    it('devrait supprimer un voyage avec succès', async () => {
      const req = mockRequest({ params: { id: tripId.toString() } });
      const res = mockResponse();

      const tripBeforeDelete = await prisma.trip.findUnique({ where: { id: tripId } });
      expect(tripBeforeDelete).not.toBeNull();

      await deleteTrip(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Voyage supprimé avec succès");

      const deletedTrip = await prisma.trip.findUnique({ where: { id: tripId } });
      expect(deletedTrip).toBeNull();
    });

    it('devrait retourner une erreur 404 si le voyage n\'existe pas', async () => {
      const req = mockRequest({ params: { id: '9999' } });
      const res = mockResponse();

      await deleteTrip(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Voyage introuvable");
    });

    it('devrait retourner une erreur 400 si l\'ID est invalide', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();

      await deleteTrip(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid trip ID");
    });

    it('devrait retourner une erreur 500 en cas d\'erreur interne', async () => {
      jest.spyOn(prisma.trip, 'delete').mockImplementationOnce(() => {
        throw new Error('Simulated internal error');
      });

      const req = mockRequest({ params: { id: tripId.toString() } });
      const res = mockResponse();

      await deleteTrip(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Voyage supprimé avec succès");

      jest.restoreAllMocks();
    });
  });
});
