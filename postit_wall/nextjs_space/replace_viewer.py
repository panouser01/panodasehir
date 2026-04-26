import re

content = open('app/admin/page.tsx').read()

viewer_html = """
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>
                      Görebilir (Sadece Seçili Gruptaki Kullanıcılar)
                    </Label>
                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                      {!wallForm.userGroupId ? (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Lütfen önce bir Grup Yetkisi seçin.
                        </p>
                      ) : users.filter(
                          (u) =>
                            u.role !== "SUPER_ADMIN" &&
                            u.userGroups?.some(
                              (g: any) => g.id === wallForm.userGroupId,
                            ),
                        ).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Seçili grupta henüz hiç kullanıcı bulunmuyor.
                        </p>
                      ) : (
                        users
                          .filter(
                            (u) =>
                              u.role !== "SUPER_ADMIN" &&
                              u.userGroups?.some(
                                (g: any) => g.id === wallForm.userGroupId,
                              ),
                          )
                          .map((viewer) => (
                            <div
                              key={viewer.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`viewer-${viewer.id}`}
                                checked={wallForm.wallViewerIds.includes(
                                  viewer.id,
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setWallForm({
                                      ...wallForm,
                                      wallViewerIds: [
                                        ...wallForm.wallViewerIds,
                                        viewer.id,
                                      ],
                                    });
                                  } else {
                                    setWallForm({
                                      ...wallForm,
                                      wallViewerIds:
                                        wallForm.wallViewerIds.filter(
                                          (id) => id !== viewer.id,
                                        ),
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`viewer-${viewer.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {viewer.name}{" "}
                                <span className="text-xs text-gray-500">
                                  ({viewer.role})
                                </span>
                              </label>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
"""

target = """                  </div>
                </div>
              </TabsContent>"""

replacement = """                  </div>
                </div>""" + viewer_html + """
              </TabsContent>"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced successfully")
    open('app/admin/page.tsx', 'w').write(content)
else:
    print("Could not find target")
