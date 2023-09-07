import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request, response) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return response.send(memory)
  })

  app.post('/memories', async (request, response) => {
    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const newMemory = await prisma.memory.create({
      data: {
        coverUrl,
        content,
        isPublic,
        userId: '6ed1c9e9-260a-477d-a9d1-7d5e62efe44d',
      },
    })

    return response.send({ message: 'Memória criada com sucesso.', newMemory })
  })

  app.delete('/memories/:id', async (request, response) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    await prisma.memory.delete({
      where: {
        id,
      },
    })

    return response.send({
      message: 'Apagado com sucesso a memória de id: ',
      id,
    })
  })

  app.put('/memories/:id', async (request, response) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const newMemory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return response.send(newMemory)
  })
}
