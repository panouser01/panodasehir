with open('app/merchant/register/page.tsx', 'r') as f:
    code = f.read()

logic_to_add = """
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file || file.size === 0) return null;
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
      
      if (type === 'SOLE') {
        payload.cityId = merchantSoleCityId;
        payload.districtId = merchantSoleDistrictId;
      } else {
        payload.cityId = merchantCorpCityId;
        payload.districtId = merchantCorpDistrictId;
      }

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

code = code.replace("const [selectedWalls, setSelectedWalls] = useState<string[]>([])", "const [selectedWalls, setSelectedWalls] = useState<string[]>([])\n" + logic_to_add)

with open('app/merchant/register/page.tsx', 'w') as f:
    f.write(code)

print("Patch 2 complete.")
