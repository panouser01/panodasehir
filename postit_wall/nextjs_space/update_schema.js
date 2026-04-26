const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (!schema.includes('PostItView')) {
  // Add PostItView model
  const postItView = `
model PostItView {
  id        String   @id @default(cuid())
  userId    String?
  postItId  String
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  PostIt    PostIt   @relation(fields: [postItId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([postItId])
  @@unique([userId, postItId])
}
`;
  schema += postItView;

  // Add relations
  schema = schema.replace(/model User \{[\s\S]*?@@index/m, match => match.replace('@@index', 'viewsRecord PostItView[]\n  @@index'));
  schema = schema.replace(/model PostIt \{[\s\S]*?@@index/m, match => match.replace('@@index', 'viewsRecord PostItView[]\n  @@index'));

  fs.writeFileSync(schemaPath, schema);
  console.log("Schema updated.");
} else {
  console.log("PostItView already exists.");
}
