// require('dotenv').config({ path: '.env.test' });
// import { createComments, updateComment, deleteComment } from '../../src/services/comments.service';
// import { PrismaClient } from '@prisma/client';
// import { Request, Response } from 'express';

// const prisma = new PrismaClient();

// function mockRequest(data?: any): Request {
//   const req = {} as Request;
//   req.body = data?.body || {};
//   req.params = data?.params || {};
//   return req;
// }

// function mockResponse(): Response {
//   const res = {} as Response;
//   res.status = jest.fn().mockReturnThis() as unknown as jest.Mock;
//   res.send = jest.fn().mockReturnThis() as unknown as jest.Mock;
//   return res;
// }

// describe('Services de Commentaires', () => {
//   let userId: number;
//   let tripId: number;
//   let stepId: number;
//   let commentId: number | undefined;

//   beforeAll(async () => {
//     await prisma.$connect();

//     // Create a user
//     const user = await prisma.user.create({
//       data: {
//         email: 'testuser@example.com',
//         password: 'password123',
//         firstName: 'Test',
//         lastName: 'User',
//         address: '123 Rue de Test, Paris, France',
//       },
//     });
//     userId = user.id;

//     // Create a trip
//     const trip = await prisma.trip.create({
//       data: {
//         name: 'Voyage de test',
//         summary: 'Ceci est un voyage de test',
//         startDate: new Date('2024-01-01'),
//         endDate: new Date('2024-01-10'),
//         country: 'France',
//         userId: userId,
//         isPublic: true,
//       },
//     });
//     tripId = trip.id;

//     // Create a step associated with the trip
//     const step = await prisma.step.create({
//       data: {
//         tripId: tripId,
//         stepDate: new Date(),
//         name: 'Étape de test',
//         description: 'Description de l’étape de test',
//       },
//     });
//     stepId = step.id;
//   });

//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   describe('createComments', () => {
//     it('devrait créer un commentaire avec succès', async () => {
//       const req = mockRequest({
//         body: {
//           userId: userId,
//           stepId: stepId,
//           comment: 'Ceci est un commentaire de test',
//         },
//       });
//       const res = mockResponse();

//       await createComments(req, res);

//       expect(res.send).toHaveBeenCalled();
//       const responseString = (res.send as jest.Mock).mock.calls[0][0];
      
//       // Check if the response is valid JSON
//       let responseData;
//       try {
//         responseData = JSON.parse(responseString);
//       } catch {
//         throw new Error(`Invalid JSON response: ${responseString}`);
//       }
      
//       expect(responseData).toHaveProperty('id');
//       expect(responseData.comment).toBe('Ceci est un commentaire de test');

//       commentId = responseData.id; // Store the comment ID for later tests
//     });
//   });

//   describe('updateComment', () => {
//     it('devrait mettre à jour un commentaire avec succès', async () => {
//       if (commentId === undefined) {
//         throw new Error('commentId is not initialized');
//       }

//       const req = mockRequest({
//         params: { id: commentId.toString() },
//         body: {
//           userId: userId,
//           stepId: stepId,
//           comment: 'Commentaire mis à jour',
//         },
//       });
//       const res = mockResponse();

//       await updateComment(req, res);

//       expect(res.send).toHaveBeenCalled();
//       const responseString = (res.send as jest.Mock).mock.calls[0][0];

//       // Check if the response is valid JSON
//       let responseData;
//       try {
//         responseData = JSON.parse(responseString);
//       } catch {
//         throw new Error(`Invalid JSON response: ${responseString}`);
//       }
      
//       expect(responseData.comment).toBe('Commentaire mis à jour');
//     });
//   });

//   describe('deleteComment', () => {
//     it('devrait supprimer un commentaire avec succès', async () => {
//       if (commentId === undefined) {
//         throw new Error('commentId is not initialized');
//       }

//       const req = mockRequest({ params: { id: commentId.toString() } });
//       const res = mockResponse();

//       await deleteComment(req, res);

//       expect(res.send).toHaveBeenCalledWith('Comment delete');

//       // Check that the comment has been deleted
//       const deletedComment = await prisma.comment.findUnique({ where: { id: commentId } });
//       expect(deletedComment).toBeNull();
//     });

//     it('devrait renvoyer une erreur si le commentaire n\'existe pas', async () => {
//       const req = mockRequest({ params: { id: '9999' } }); // Non-existent ID
//       const res = mockResponse();

//       await deleteComment(req, res);

//       expect(res.send).toHaveBeenCalledWith('Comment not delete');
//     });
//   });
// });
