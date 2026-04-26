const { z } = require('zod')
const updateSchema = z.object({
      content: z.string().optional(),
      categoryId: z.string().optional(),
      color: z.enum(['YELLOW', 'PINK', 'BLUE', 'GREEN', 'ORANGE', 'PURPLE', 'TRANSPARENT', 'BLACK']).optional(),
      font: z.enum(['HANDWRITING', 'SERIF', 'SANS', 'MONO', 'CURSIVE', 'SYSTEM', 'MODERN', 'PLAYFUL']).optional(),
      pushpin: z.enum(['RED', 'BLUE', 'GOLD', 'GREEN', 'PINK', 'SILVER', 'BLACK', 'TAPE', 'NONE']).optional(),
      link: z.string().nullable().optional(),
      isApproved: z.boolean().optional(),
      isPublished: z.boolean().optional(),
      expiresInDays: z.string().optional(),
      expiresAtDate: z.string().optional(),
      imageUrl: z.string().nullable().optional(),
      imageUrls: z.array(z.string()).optional(),
      textSize: z.string().optional(),
      textColor: z.string().optional()
    })

console.log(updateSchema.safeParse({ content: '', categoryId: '', color: 'YELLOW', font: 'HANDWRITING', pushpin: 'RED', link: '', isApproved: false, isPublished: true, imageUrl: '', imageUrls: [], expiresInDays: 'custom', expiresAtDate: '2027-12-17', textSize: 'text-base', textColor: '#000000' }).error)
