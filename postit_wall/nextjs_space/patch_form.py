import re

# Read the file
with open('app/merchant/register/page.tsx', 'r') as f:
    original = f.read()

code = original

# Define mappings from placeholder -> name attribute
mappings = {
    'Mağaza Adı (Görünen Ad)': 'storeName',
    'Mağaza Logosu': 'storeLogo',
    'Mağaza Sloganı': 'storeSlogan',
    'Kullanıcı Adı': 'username',
    'Şifre': 'password',
    'Yetkili Adı': 'contactFirstName',
    'Yetkili Soyadı': 'contactLastName',
    'Telefon Numarası': 'contactPhone',
    'Mail Adresi': 'contactEmail',
    'Adres Bilgisi': 'address',
    'Vergi Dairesi': 'taxOffice',
    'TC Kimlik No': 'taxId',
    'Banka IBAN': 'iban',
    'Vergi Levhası': 'taxPlateUrl',
    'İmza Sirküsü': 'signatureCircularUrl',
    'Kimlik Ön Yüz': 'idCardFrontUrl',
    'Kimlik Arka Yüz': 'idCardBackUrl',
    'Ticaret Sicil No': 'registryNumber',
    'Ticaret Sicil Gazetesi': 'tradeRegistryGazetteUrl'
}

# The trick: regex to match the Label and the EXACT following Input/Textarea.
# Let's write a generic parsing replacing function.
import sys
# It might be simpler to sequentially find `<Label>...` and standardly replace the next `<Input ...>`
lines = code.split('\n')
for i, line in enumerate(lines):
    if '<Label>' in line:
        # find which field it is
        field_name = None
        for key, val in mappings.items():
            if key in line:
                field_name = val
                break
        
        if field_name:
            # Look ahead for standard <Input or <Textarea
            for j in range(i+1, min(i+5, len(lines))):
                if '<Input' in lines[j] and 'name=' not in lines[j]:
                    lines[j] = lines[j].replace('<Input', f'<Input name="{field_name}"', 1)
                    break
                elif '<Textarea' in lines[j] and 'name=' not in lines[j]:
                    lines[j] = lines[j].replace('<Textarea', f'<Textarea name="{field_name}"', 1)
                    break

# Now, wrap the TabsContent contents in a form.
# We also need a handleSubmit function.

imports_to_add = """import { useState } from 'react';
import { useRouter } from 'next/navigation';
"""

# add router hook and handleSubmit
logic_to_add = """
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url || data.fileUrl || data.filepath;
      }
    } catch(e) {
      console.error(e);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'SOLE' | 'CORP') => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formElement = e.currentTarget;
      const data = new FormData(formElement);
      const payload: any = { companyType: type, selectedWallIds: selectedWalls };
      
      // Inject cities/districts that use Radix Selects
      if (type === 'SOLE') {
        payload.cityId = merchantSoleCityId;
        payload.districtId = merchantSoleDistrictId;
      } else {
        payload.cityId = merchantCorpCityId;
        payload.districtId = merchantCorpDistrictId;
      }

      // Process standard fields and files
      for (const [key, value] of Array.from(data.entries())) {
        if (value instanceof File && value.size > 0 && value.name) {
          const uploadedUrl = await uploadFile(value);
          payload[key] = uploadedUrl;
        } else if (typeof value === 'string') {
          payload[key] = value;
        }
      }

      const res = await fetch('/api/auth/merchant-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (res.ok) {
        alert(result.message || 'Başvurunuz başarıyla alındı!');
        router.push('/');
      } else {
        alert(result.error || 'Kayıt sırasında hata oluştu.');
      }
    } catch (err) {
      console.error('Submit error', err);
      alert('Sistemsel bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
"""

new_code = '\n'.join(lines)

# Inject hooks
if 'const router = useRouter();' not in new_code:
    new_code = new_code.replace('const [searchQuery, setSearchQuery] = useState(\'\');', 'const [searchQuery, setSearchQuery] = useState(\'\');\n' + logic_to_add)

if 'import { useRouter }' not in new_code:
    new_code = new_code.replace('import { Button } from "@/components/ui/button"', 'import { Button } from "@/components/ui/button"\nimport { useRouter } from "next/navigation"')

# Inject form wrappers
new_code = new_code.replace('<TabsContent value="sole" className="p-6 md:p-8 m-0 outline-none">\n                <div className="max-w-4xl space-y-8">', '<TabsContent value="sole" className="p-6 md:p-8 m-0 outline-none"><form onSubmit={(e) => handleSubmit(e, "SOLE")}>\n                <div className="max-w-4xl space-y-8">')

# Close form wrappers
# In page.tsx:
#                   <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
#                     <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-12 text-lg rounded-xl shadow-lg shadow-blue-200">Başvuruyu Gönder</Button>
#                   </div>
#                 </div>
#               </TabsContent>

# We can replace <Button ...>Başvuruyu Gönder</Button> with <Button type="submit" disabled={isSubmitting}> ...
new_code = new_code.replace('>Başvuruyu Gönder</Button>', ' type="submit" disabled={isSubmitting}>{isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}</Button>')

# Change closing TabsContent to close form first for SOLE
new_code = new_code.replace('                </div>\n              </TabsContent>\n\n              {/* LİMİTED/ANONİM ŞİRKET */}', '                </div>\n              </form></TabsContent>\n\n              {/* LİMİTED/ANONİM ŞİRKET */}')

# Open form for CORP
new_code = new_code.replace('<TabsContent value="corp" className="p-6 md:p-8 m-0 outline-none">\n                <div className="max-w-4xl space-y-8">', '<TabsContent value="corp" className="p-6 md:p-8 m-0 outline-none"><form onSubmit={(e) => handleSubmit(e, "CORP")}>\n                <div className="max-w-4xl space-y-8">')

# Close form for CORP
new_code = new_code.replace('                </div>\n              </TabsContent>\n            </Tabs>', '                </div>\n              </form></TabsContent>\n            </Tabs>')

with open('app/merchant/register/page.tsx', 'w') as f:
    f.write(new_code)

print("Patching complete.")
