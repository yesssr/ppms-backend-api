import os
import re
import json

endpoints = [
    ("Case Studies", "/api/case-studies", [
        ("GET", "/", "List Case Studies", None),
        ("GET", "/:id", "Get Case Study", None),
        ("POST", "/", "Create Case Study", {
            "title": "Scalable Infrastructure for E-Commerce",
            "problem": "Legacy system couldn't handle Black Friday traffic.",
            "solution": "Migrated to a serverless AWS architecture.",
            "result": "99.99% uptime during peak loads, 40% cost reduction.",
            "isPublished": True,
            "projectId": "uuid-of-a-project"
        }),
        ("PUT", "/:id", "Update Case Study", {
            "title": "Scalable Infrastructure for E-Commerce (Updated)",
            "isPublished": False
        }),
        ("DELETE", "/:id", "Delete Case Study", None),
    ]),
    ("Departments", "/api/departments", [
        ("GET", "/", "List Departments", None),
        ("GET", "/:id", "Get Department", None),
        ("POST", "/", "Create Department", {
            "name": "Engineering",
            "description": "Core software development and IT infrastructure.",
            "isActive": True
        }),
        ("PUT", "/:id", "Update Department", {
            "name": "Engineering",
            "isActive": False
        }),
        ("DELETE", "/:id", "Delete Department", None),
    ]),
    ("Documents", "/api/documents", [
        ("GET", "/", "List Documents", None),
        ("GET", "/:id", "Get Document", None),
        ("POST", "/", "Create Document", {
            "entityType": "project",
            "entityId": "uuid-of-project",
            "fileName": "Architecture_Diagram.pdf",
            "fileType": "application/pdf",
            "fileSize": 1048576,
            "fileKey": "uploads/projects/Architecture_Diagram.pdf"
        }),
        ("PUT", "/:id", "Update Document", {
            "fileName": "Updated_Architecture_Diagram.pdf"
        }),
        ("DELETE", "/:id", "Delete Document", None),
        ("GET", "/:id/download", "Download Document", None),
    ]),
    ("Projects", "/api/projects", [
        ("GET", "/track/:code", "Track Project", None),
        ("GET", "/", "List Projects", None),
        ("GET", "/:id", "Get Project", None),
        ("GET", "/:id/logs", "Get Project Logs", None),
        ("POST", "/", "Create Project", {
            "name": "Mobile App V2",
            "description": "Complete redesign and native rewrite.",
            "clientName": "Acme Corp",
            "status": "in_progress",
            "startDate": "2026-09-01",
            "endDate": "2027-01-01",
            "budget": "50000",
            "serviceId": "uuid-of-a-service"
        }),
        ("PUT", "/:id", "Update Project", {
            "status": "completed"
        }),
        ("PUT", "/:id/progress", "Update Project Progress", {
            "progressPercentage": 75,
            "message": "Finished the backend API integration."
        }),
        ("DELETE", "/:id", "Delete Project", None),
    ]),
    ("Services", "/api/services", [
        ("GET", "/", "List Services", None),
        ("GET", "/:id", "Get Service", None),
        ("POST", "/", "Create Service", {
            "name": "Cloud Migration",
            "description": "Moving legacy on-premise solutions to AWS/GCP.",
            "isActive": True
        }),
        ("PUT", "/:id", "Update Service", {
            "isActive": False
        }),
        ("DELETE", "/:id", "Delete Service", None),
    ]),
    ("Tasks", "/api/tasks", [
        ("GET", "/", "List Tasks", None),
        ("GET", "/:id", "Get Task", None),
        ("POST", "/", "Create Task", {
            "projectId": "uuid-of-project",
            "assigneeId": "uuid-of-user",
            "title": "Design Database Schema",
            "description": "Create Drizzle schemas for the new feature.",
            "priority": "high",
            "status": "todo",
            "startDate": "2026-08-25",
            "dueDate": "2026-08-30"
        }),
        ("PUT", "/:id", "Update Task", {
            "status": "in_progress"
        }),
        ("DELETE", "/:id", "Delete Task", None),
    ]),
    ("Teams", "/api/teams", [
        ("GET", "/", "List Teams", None),
        ("GET", "/:id", "Get Team", None),
        ("POST", "/", "Create Team", {
            "name": "Alpha Squad",
            "description": "Frontend specialists team."
        }),
        ("PUT", "/:id", "Update Team", {
            "name": "Alpha Squad Reborn"
        }),
        ("DELETE", "/:id", "Delete Team", None),
        ("GET", "/:id/members", "List Team Members", None),
        ("POST", "/:id/members", "Add Team Member", {
            "userId": "uuid-of-user"
        }),
        ("DELETE", "/:id/members", "Remove Team Member", {
            "userId": "uuid-of-user"
        }),
    ]),
    ("Technologies", "/api/technologies", [
        ("GET", "/", "List Technologies", None),
        ("GET", "/:id", "Get Technology", None),
        ("POST", "/", "Create Technology", {
            "name": "Next.js",
            "category": "Frontend Framework",
            "isActive": True
        }),
        ("PUT", "/:id", "Update Technology", {
            "isActive": False
        }),
        ("DELETE", "/:id", "Delete Technology", None),
    ]),
    ("Testimonials", "/api/testimonials", [
        ("GET", "/", "List Testimonials", None),
        ("GET", "/:id", "Get Testimonial", None),
        ("POST", "/", "Create Testimonial", {
            "projectId": "uuid-of-project",
            "clientName": "Jane Doe",
            "rating": 5,
            "message": "Absolutely stellar work, delivered ahead of schedule.",
            "status": "approved"
        }),
        ("PUT", "/:id", "Update Testimonial", {
            "status": "rejected"
        }),
        ("DELETE", "/:id", "Delete Testimonial", None),
    ]),
    ("Users", "/api/users", [
        ("GET", "/", "List Users", None),
        ("GET", "/:id", "Get User", None),
        ("POST", "/", "Create User", {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "role": "admin",
            "departmentId": "uuid-of-department",
            "password": "SecurePassword123!"
        }),
        ("PUT", "/:id", "Update User", {
            "role": "member"
        }),
        ("DELETE", "/:id", "Delete User", None),
    ]),
]

def make_bru(method, url, name, seq, payload):
    body_section = ""
    if method in ["POST", "PUT", "PATCH", "DELETE"] and payload is not None:
        json_str = json.dumps(payload, indent=2)
        # Indent it correctly for Bruno syntax
        indented_json = "\n".join("  " + line for line in json_str.split("\n"))
        body_section = f"\nbody:json {{\n{indented_json}\n}}"
    elif method in ["POST", "PUT", "PATCH"]:
        body_section = "\nbody:json {\n  {}\n}"
    
    return f"""meta {{
  name: {name}
  type: http
  seq: {seq}
}}

{method.lower()} {{
  url: {url}
  body: {'json' if body_section else 'none'}
  auth: none
}}{body_section}
"""

def slugify(value):
    return re.sub(r'[\/:*?"<>|]', '_', value)

os.makedirs("bruno", exist_ok=True)

for folder, prefix, routes in endpoints:
    folder_path = os.path.join("bruno", folder)
    os.makedirs(folder_path, exist_ok=True)
    
    seq = 1
    for method, path, name, payload in routes:
        full_url = f"{{{{baseUrl}}}}{prefix}{path}" if path != "/" else f"{{{{baseUrl}}}}{prefix}"
        bru_content = make_bru(method, full_url, name, seq, payload)
        file_name = f"{slugify(name)}.bru"
        with open(os.path.join(folder_path, file_name), "w") as f:
            f.write(bru_content)
        seq += 1

print("Done re-generating Bruno endpoints with realistic payloads.")
