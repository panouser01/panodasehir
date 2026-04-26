from prisma import Client
import asyncio

async def main():
    client = Client()
    await client.connect()
    cats = await client.category.find_many(where={'title': {'contains': 'hava', 'mode': 'insensitive'}})
    for c in cats:
        print(f"ID: {c.id}, Title: {c.title}, Slug: {c.slug}")
    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
