import re

# 1. Update app/api/categories/route.ts
route_content = open('app/api/categories/route.ts').read()

start_marker = "children: {"
end_marker = """
        _count: {"""

parts = route_content.split(end_marker)
first_part = parts[0]

# find the FIRST "children: {" after "city: { select: { id: true, name: true } },"
split_str = "district: { select: { id: true, name: true } },"

if split_str in first_part:
    pre_children, _, post_children = first_part.partition(split_str)
    
    # We will generate up to depth 8 from here
    def gen(d, max_d):
        if d > max_d: return "true"
        return """{
              include: {
                wallViewers: { select: { id: true, name: true, email: true } },
                assignedGroup: true,
                wallManagers: { select: { id: true, name: true, email: true } },
                _count: { select: { postits: { where: activeFilter } } },
                city: { select: { id: true, name: true } },
                district: { select: { id: true, name: true } },
                children: %s
              },
              orderBy: [
                { order: 'asc' },
                { name: 'asc' }
              ]
            }""" % gen(d+1, max_d)
            
    new_first = pre_children + split_str + "\n        children: " + gen(1, 8)
    new_content = new_first + end_marker + parts[1]
    open('app/api/categories/route.ts', 'w').write(new_content)
    print("Updated route.ts to 8 levels depth")


# 2. Update lib/services/category.service.ts
svc_content = open('lib/services/category.service.ts').read()

if "children: {" in svc_content:
    s_split = "wallViewers: { select: { id: true } },"
    
    pre, _, post = svc_content.partition(s_split)
    # The next line is 'children: {'
    end_marker_svc = """
      where: {
        parentId: null
      },"""
    
    if end_marker_svc in post:
        parts_svc = post.split(end_marker_svc)
        
        def gen2(d, max_d):
            if d > max_d: return "true"
            return """{
          include: {
            wallViewers: { select: { id: true } },
            wallManagers: { select: { id: true } },
            children: %s
          },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' }
          ]
        }""" % gen2(d+1, max_d)
        
        new_post = "\n        children: " + gen2(1, 8) + "\n      }," + end_marker_svc + parts_svc[1]
        new_svc_cnt = pre + s_split + new_post
        open('lib/services/category.service.ts', 'w').write(new_svc_cnt)
        print("Updated category.service.ts to 8 levels depth")
