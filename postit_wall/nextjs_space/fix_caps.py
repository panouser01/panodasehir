from prisma import Client
import asyncio

async def main():
    client = Client()
    await client.connect()
    
    cats = await client.category.find_many()
    print("Found categories:")
    for cat in cats:
        if cat.name.isupper():
            print(f"Uppercase found: {cat.name} (ID: {cat.id})")

if __name__ == '__main__':
    asyncio.run(main())
