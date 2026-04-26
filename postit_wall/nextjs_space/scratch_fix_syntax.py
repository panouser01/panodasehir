import re

file_path = "components/postit/postit-card.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix carousel img trailing div
content = content.replace(
"""                                 }}
                              />
                            </div>
                          )}
                        </div>
                      </CarouselItem>""",
"""                                 }}
                              />
                          )}
                        </div>
                      </CarouselItem>"""
)

# Fix single img trailing div
content = content.replace(
"""                            }
                          }}
                        />
                      </div>
                    )}
                </div>""",
"""                            }
                          }}
                        />
                    )}
                </div>"""
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("SUCCESS")
