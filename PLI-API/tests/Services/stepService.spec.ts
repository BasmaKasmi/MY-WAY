require('dotenv').config({ path: '.env.test' });
import { createStep, updateStep, deleteStep } from '../../src/services/Steps.service';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { createTrip } from '../../src/services/Trips.service';

const prisma = new PrismaClient();

function mockRequest(data?: any): Request {
  const req = {} as Request;
  req.body = data?.body || {};
  req.params = data?.params || {};
  return req;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe('Services de Steps', () => {
  let userId: number;
  let tripId: number;
  let stepId: number;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.photo.deleteMany();
    await prisma.step.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        address: '123 Rue Test',
      },
    });
    userId = user.id;

    const trip = await createTrip({
      name: 'Test Trip',
      summary: 'A trip for testing',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'),
      country: 'France',
      userId,
      isPublic: true,
    });
    tripId = trip.id;
  });

  describe('createStep', () => {
    it('devrait créer une étape avec succès', async () => {
      const req = mockRequest({
        body: {
          tripId,
          stepDate: '2024-01-05',
          name: 'Step 1',
          description: 'Description for Step 1',
          photos: [
            {
              image: 'data:image/png;base64,iVBORw0KGgo=',
              mimeType: 'image/png',
            },
          ],
        },
      });
      const res = mockResponse();

      await createStep(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.step).toHaveProperty('id');

      const createdStep = await prisma.step.findUnique({ where: { id: responseData.step.id } });
      expect(createdStep).not.toBeNull();
      expect(createdStep?.name).toBe('Step 1');
    });

    it('devrait renvoyer une erreur si des champs obligatoires sont manquants', async () => {
      const req = mockRequest({
        body: {
          stepDate: '2024-01-05',
        },
      });
      const res = mockResponse();

      await createStep(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Les champs obligatoires sont manquants' });
    });
  });

  describe('updateStep', () => {
    beforeEach(async () => {
      const step = await prisma.step.create({
        data: {
          tripId,
          stepDate: new Date('2024-01-05'),
          name: 'Original Step',
          description: 'Original description',
        },
      });
      stepId = step.id;
    });

    it('devrait mettre à jour une étape avec succès', async () => {
      const req = mockRequest({
        params: { id: stepId.toString() },
        body: {
          name: 'Updated Step',
          description: 'Updated description',
        },
      });
      const res = mockResponse();

      await updateStep(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.step.name).toBe('Updated Step');
      expect(responseData.step.description).toBe('Updated description');
    });

    it('devrait ajouter des photos à une étape existante', async () => {
      const req = mockRequest({
        params: { id: stepId.toString() },
        body: {
          photos: [
            {
              image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQ',
              mimeType: 'image/jpeg',
            },
          ],
        },
      });
      const res = mockResponse();

      await updateStep(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const updatedStep = await prisma.step.findUnique({
        where: { id: stepId },
        include: { photos: true },
      });
      expect(updatedStep?.photos.length).toBe(1);
    });

    it('devrait renvoyer une erreur si l\'étape n\'existe pas', async () => {
      const req = mockRequest({
        params: { id: '9999' },
        body: { name: 'Nonexistent Step' },
      });
      const res = mockResponse();

      await updateStep(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erreur lors de la mise à jour de l'étape et des photos" });
    });
  });

  describe('deleteStep', () => {
    beforeEach(async () => {
      const step = await prisma.step.create({
        data: {
          tripId,
          stepDate: new Date('2024-01-05'),
          name: 'Step to Delete',
          description: 'Description for deletion',
        },
      });
      stepId = step.id;
    });

    it('devrait supprimer une étape avec succès', async () => {
      const req = mockRequest({ params: { id: stepId.toString() } });
      const res = mockResponse();

      await deleteStep(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Étape supprimée avec succès' });

      const deletedStep = await prisma.step.findUnique({ where: { id: stepId } });
      expect(deletedStep).toBeNull();
    });

    it('devrait renvoyer une erreur si l\'étape n\'existe pas', async () => {
      const req = mockRequest({ params: { id: '9999' } });
      const res = mockResponse();

      await deleteStep(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Étape introuvable' });
    });
  });
});
