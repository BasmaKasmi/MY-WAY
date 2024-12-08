// import { handleLocation, getLocation, getAll } from '../../src/controllers/location.controller';
// import { PrismaClient } from '@prisma/client';
// import axios from 'axios';
// import { Request, Response } from 'express';

// jest.mock('axios');

// const prisma = new PrismaClient();

// const mockRequest = (body: any = {}, params: any = {}): Partial<Request> => ({
//   body,
//   params,
// });

// function mockResponse(): Response {
//     const res = {} as Response;
//     res.status = jest.fn().mockReturnThis();
//     res.send = jest.fn().mockReturnThis();
//     res.json = jest.fn().mockReturnThis();
//     return res;
//   }
// describe('Location Service', () => {
//   let userId: number;
//   let tripId: number;

//   beforeAll(async () => {
//     await prisma.$connect();
//     const user = await prisma.user.create({
//       data: {
//         firstName: 'VIGNISSI',
//         lastName: 'Yabo',
//         email: 'yabo@gmail.com',
//         password: 'password123',
//         address: '123 Test Street',
//       },
//     });
//     userId = user.id;

//     const trip = await prisma.trip.create({
//       data: {
//         name: 'Trip',
//         summary: 'Test trip summary',
//         startDate: new Date('2024-01-01'),
//         endDate: new Date('2024-01-10'),
//         country: 'Test Country',
//         userId,
//         isPublic: true,
//       },
//     });
//     tripId = trip.id;
//   });

//   afterAll(async () => {
//     await prisma.location.deleteMany();
//     await prisma.trip.deleteMany();
//     await prisma.user.deleteMany();
//     await prisma.$disconnect();
//   });

//   describe('handleLocation', () => {
//     it('should return error if parameters are missing', async () => {
//       const req = mockRequest({ latitude: 12.34 });
//       const res = mockResponse();

//       await handleLocation(req as Request, res as Response);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({ error: 'Paramètres manquants' });
//     });

//     it('should save a new location successfully', async () => {
//       (axios.get as jest.Mock).mockResolvedValueOnce({
//         data: {
//           address: { city: 'Test City' },
//         },
//       });

//       const req = mockRequest({
//         latitude: 12.34,
//         longitude: 56.78,
//         userId,
//         tripId,
//       });
//       const res = mockResponse();

//       await handleLocation(req as Request, res as Response);

//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           message: 'Localisation enregistrée',
//           location: expect.objectContaining({
//             city: 'Test City',
//           }),
//         })
//       );
//     });

//     it('should return the same city message if within 1 hour', async () => {
//       const now = new Date();
//       await prisma.location.create({
//         data: {
//           city: 'Test City',
//           latitude: 12.34,
//           longitude: 56.78,
//           userId,
//           tripId,
//           createdAt: now,
//         },
//       });

//       const req = mockRequest({
//         latitude: 12.34,
//         longitude: 56.78,
//         userId,
//         tripId,
//       });
//       const res = mockResponse();

//       await handleLocation(req as Request, res as Response);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           message: `Vous êtes toujours à Test City`,
//         })
//       );
//     });

//     it('should return error if reverse geocoding fails', async () => {
//       (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

//       const req = mockRequest({
//         latitude: 12.34,
//         longitude: 56.78,
//         userId,
//         tripId,
//       });
//       const res = mockResponse();

//       await handleLocation(req as Request, res as Response);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: 'Erreur serveur' });
//     });
//   });

//   describe('getLocation', () => {
//     it('should return the latest location for a user and trip', async () => {
//       const location = await prisma.location.create({
//         data: {
//           city: 'Latest City',
//           latitude: 45.67,
//           longitude: 89.01,
//           userId,
//           tripId,
//         },
//       });
  
//       const req = mockRequest({}, { userId: String(userId), tripId: String(tripId) }) as Request<{
//         userId: string;
//         tripId: string;
//       }>;
//       const res = mockResponse();
  
//       await getLocation(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           location: expect.objectContaining({
//             city: location.city,
//           }),
//         })
//       );
//     });
  
//     it('should return error if no location is found', async () => {
//       const req = mockRequest({}, { userId: '9999', tripId: '9999' }) as Request<{
//         userId: string;
//         tripId: string;
//       }>;
//       const res = mockResponse();
  
//       await getLocation(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(404);
//       expect(res.json).toHaveBeenCalledWith({
//         error: 'Aucune localisation trouvée pour cet utilisateur et ce voyage',
//       });
//     });
//   });
  

//   describe('getAll', () => {
//     it('should return all locations', async () => {
//       const req = mockRequest();
//       const res = mockResponse();

//       await getAll(req as Request, res as Response);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.send).toHaveBeenCalledWith(expect.any(String));
//     });

//     it('should return error if fetching locations fails', async () => {
//       jest.spyOn(prisma.location, 'findMany').mockImplementationOnce(() => {
//         throw new Error('Database error');
//       });

//       const req = mockRequest();
//       const res = mockResponse();

//       await getAll(req as Request, res as Response);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.send).toHaveBeenCalledWith(
//         expect.objectContaining({
//           error: 'Could not retrieve location',
//         })
//       );

//       jest.restoreAllMocks();
//     });
//   });
// });
