import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

merchant_model = """

model MerchantApplication {
  id                      String    @id @default(cuid())
  companyType             String    // 'SOLE' or 'CORP'
  
  // Mağaza / Platform Bilgileri
  storeName               String
  storeLogo               String?
  storeSlogan             String?
  username                String    @unique
  passwordHash            String
  
  // İrtibat Bilgileri
  contactFirstName        String
  contactLastName         String
  contactPhone            String
  contactEmail            String
  address                 String
  cityId                  String
  districtId              String
  
  // Resmi / Finansal Bilgiler
  taxOffice               String
  taxId                   String
  iban                    String
  
  // Dosyalar (Ortak)
  taxPlateUrl             String?
  signatureCircularUrl    String?
  idCardFrontUrl          String?
  idCardBackUrl           String?
  
  // Dosyalar (Limited/Anonim için ekstra)
  registryNumber          String?
  tradeRegistryGazetteUrl String?
  
  // İlişkiler
  city                    City      @relation(fields: [cityId], references: [id])
  district                District  @relation(fields: [districtId], references: [id])
  
  // Seçilen Duvarlar
  selectedWallIds         Json      @default("[]")
  
  // Durum
  status                  String    @default("PENDING") // PENDING, APPROVED, REJECTED
  remarks                 String?   
  
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
}
"""

if "model MerchantApplication" not in content:
    content += merchant_model

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Schema updated successfully again.")
