import re

with open('app/admin/page.tsx', 'r') as f:
    content = f.read()

if 'const [merchants, setMerchants]' not in content:
    content = content.replace("const [users, setUsers] = useState<any[]>([])", 
                              "const [users, setUsers] = useState<any[]>([])\n  const [merchants, setMerchants] = useState<any[]>([])\n  const [userTab, setUserTab] = useState<'kullanicilar' | 'firmalar'>('kullanicilar')")

if 'app/api/admin/merchant-applications' not in content:
    content = content.replace("const [userTab, setUserTab] = useState<'kullanicilar' | 'firmalar'>('kullanicilar')", 
                              "const [userTab, setUserTab] = useState<'kullanicilar' | 'firmalar'>('kullanicilar')\n  \n  useEffect(() => {\n    if (activeSection === 'users' && userTab === 'firmalar' && merchants.length === 0) {\n      fetch('/api/admin/merchant-applications').then(res => res.json()).then(data => { if (Array.isArray(data)) setMerchants(data) })\n    }\n  }, [activeSection, userTab, merchants.length])")


header_target = """                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                  <Button onClick={openAddUser} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Kullanıcı
                  </Button>
                </div>"""
                
header_replacement = """                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 border-b border-gray-200 shadow-sm flex-col gap-4 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                    {userTab === 'kullanicilar' && (
                      <Button onClick={openAddUser} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Yeni Kullanıcı
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 pb-2">
                    <Button variant={userTab === 'kullanicilar' ? 'default' : 'outline'} onClick={() => setUserTab('kullanicilar')}>Kullanıcılar</Button>
                    <Button variant={userTab === 'firmalar' ? 'default' : 'outline'} onClick={() => setUserTab('firmalar')}>Firma Kayıtları</Button>
                  </div>
                </div>
                
                {userTab === 'firmalar' ? (
                  <div className="space-y-4">
                    {merchants.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md border">Kayıtlı firma başvurusu bulunmuyor.</div>
                    ) : (
                      <div className="bg-white rounded-lg shadow border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma Adı</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yetkili</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail / Telefon</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vergi Numarası</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {merchants.map((m: any) => (
                              <tr key={m.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{m.storeName}</div>
                                  <div className="text-sm text-gray-500">{m.companyType === 'SOLE' ? 'Şahıs' : 'Ltd/A.Ş'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {m.contactFirstName} {m.contactLastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {m.contactEmail}
                                  <br/>
                                  {m.contactPhone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {m.taxId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${m.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {m.status}
                                  </span>
                                  <div className="mt-1">
                                  {m.emailVerified ? (
                                    <span className="text-xs text-green-600 font-medium">✅ Mail Onaylı</span>
                                  ) : (
                                    <span className="text-xs text-red-500 font-medium">⏳ Onay Bekliyor</span>
                                  )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                <>"""

if "{userTab === 'firmalar' ?" not in content:
    content = content.replace(header_target, header_replacement)
    
    footer_target = """              </div>
            )
          }

          {/* PostIts Section */}"""
          
    footer_replacement = """                  </>
                )}
              </div>
            )
          }

          {/* PostIts Section */}"""
    content = content.replace(footer_target, footer_replacement)

with open('app/admin/page.tsx', 'w') as f:
    f.write(content)

print("Patch applied!")
